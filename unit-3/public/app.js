// =====================================================
// BookNest - Unit 3 frontend
// Uses the Fetch API (async/await) to talk to the Express + MySQL server
// =====================================================

// Same origin when served by the backend; full URL when index.html is opened as a file
const API_BASE = location.protocol === "file:" ? "http://localhost:3000" : "";
const BOOKS_URL = `${API_BASE}/api/books`;

let books = [];

const $ = id => document.getElementById(id);
const tableBody = $("bookTableBody");

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function showAlert(message, type = "success") {
    const box = $("alertBox");
    box.textContent = message;
    box.className = `alert alert-${type}`;
    clearTimeout(showAlert.timer);
    showAlert.timer = setTimeout(() => box.className = "alert d-none", 3500);
}

function setStatus(online, text) {
    $("statusBanner").className = `status-banner ${online ? "status-online" : "status-offline"}`;
    $("statusText").textContent = text;
}

// Reads the error message from a failed response (JSON or plain text)
async function readError(res) {
    const text = await res.text();
    try {
        const data = JSON.parse(text);
        return data.error || data.message || text;
    } catch { return text || res.statusText; }
}

// ---------- API calls ----------
async function checkStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        setStatus(res.ok && data.connected, data.message + (data.tip ? " — " + data.tip : ""));
    } catch {
        setStatus(false, "Cannot reach the Express + MySQL server on port 3000. Is the server running?");
    }
}

async function fetchBooks() {
    $("loadingState").classList.remove("d-none");
    try {
        const res = await fetch(BOOKS_URL);
        if (!res.ok) throw new Error(await readError(res));
        books = await res.json();
        renderAll();
    } catch (err) {
        books = [];
        renderAll();
        showAlert("Failed to load books: " + err.message, "danger");
    } finally {
        $("loadingState").classList.add("d-none");
    }
}

async function addBook(book) {
    const res = await fetch(BOOKS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book)
    });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
}

async function deleteBook(id) {
    const res = await fetch(`${BOOKS_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await readError(res));
}

// ---------- Rendering ----------
function renderAll() {
    $("totalCount").textContent = books.length;
    $("copiesCount").textContent = books.reduce((t, b) => t + Number(b.copies || 0), 0);
    $("genreCount").textContent = new Set(books.map(b => b.genre)).size;
    applySearch();
}

function applySearch() {
    const q = $("searchInput").value.trim().toLowerCase();
    const list = !q ? books : books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        String(b.isbn).includes(q));

    $("noRecords").classList.toggle("d-none", list.length > 0);
    tableBody.innerHTML = list.map(b => `
        <tr>
            <td>${b.id}</td>
            <td><div class="book-title">${escapeHtml(b.title)}</div><div class="book-author">${escapeHtml(b.author)}</div></td>
            <td><code>${escapeHtml(b.isbn)}</code></td>
            <td><span class="badge badge-genre">${escapeHtml(b.genre)}</span></td>
            <td>${Number(b.copies) <= 3
                ? `<span class="badge badge-warning">${b.copies}</span>`
                : `<span class="badge badge-success">${b.copies}</span>`}</td>
            <td><button class="btn btn-danger btn-sm" data-id="${b.id}" data-title="${escapeHtml(b.title)}">Delete</button></td>
        </tr>`).join("");
}

// ---------- Events ----------
$("bookForm").addEventListener("submit", async e => {
    e.preventDefault();
    const book = {
        title: $("title").value.trim(),
        author: $("author").value.trim(),
        isbn: $("isbn").value.replace(/[-\s]/g, ""),
        genre: $("genre").value,
        copies: Number($("copies").value)
    };

    const err = $("formError");
    err.textContent = "";
    if (!book.title || !book.author || !book.isbn || !book.genre) {
        err.textContent = "All fields are required.";
        return;
    }
    if (!/^97[89]\d{10}$/.test(book.isbn)) {
        err.textContent = "ISBN must be 13 digits starting with 978 or 979.";
        return;
    }

    const btn = $("submitBtn");
    btn.disabled = true;
    try {
        await addBook(book);
        e.target.reset();
        showAlert(`"${book.title}" saved to the database.`);
        await fetchBooks();
    } catch (ex) {
        err.textContent = ex.message;
    } finally {
        btn.disabled = false;
    }
});

tableBody.addEventListener("click", async e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn || !confirm(`Delete "${btn.dataset.title}" from the database?`)) return;
    try {
        await deleteBook(btn.dataset.id);
        showAlert("Book deleted.", "danger");
        await fetchBooks();
    } catch (ex) {
        showAlert(ex.message, "danger");
    }
});

$("searchInput").addEventListener("input", applySearch);
$("refreshBtn").addEventListener("click", () => { checkStatus(); fetchBooks(); });

checkStatus();
fetchBooks();
