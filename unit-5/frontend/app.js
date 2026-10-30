// =====================================================
// BookNest - Unit 5: Final full-stack frontend
// Full CRUD + search + stats + issue/return via the
// Spring Boot REST API (http://localhost:8081/api)
// =====================================================

const API_BASE = location.protocol === "file:" ? "http://localhost:8081" : "";
const API = `${API_BASE}/api`;

const $ = id => document.getElementById(id);
const tableBody = $("bookTableBody");
const modal = $("bookModal");
const form = $("bookForm");

let books = [];          // books currently shown (after server-side search / genre filter)
let searchTimer = null;

// ---------- Generic helpers ----------
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

/** fetch wrapper: parses JSON and throws an Error carrying the API's error body */
async function api(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
    if (!res.ok) {
        const err = new Error(data?.error || `Request failed (${res.status})`);
        err.fieldErrors = data?.fieldErrors || {};
        throw err;
    }
    return data;
}

// ---------- Loading data ----------
async function checkStatus() {
    const banner = $("statusBanner");
    try {
        const data = await api("/status");
        banner.className = "status-banner status-online";
        $("statusText").textContent = data.message;
    } catch {
        banner.className = "status-banner status-offline";
        $("statusText").textContent = "Cannot reach the Spring Boot API on port 8081. Start it with: mvn spring-boot:run";
    }
}

async function loadStats() {
    try {
        const s = await api("/books/stats");
        $("statTitles").textContent = s.totalTitles;
        $("statCopies").textContent = s.totalCopies;
        $("statIssued").textContent = s.issuedCopies;
        $("statRating").textContent = Number(s.averageRating).toFixed(1);
        renderBreakdown(s.byGenre || []);
        refreshGenreFilter((s.byGenre || []).map(g => g.genre));
    } catch { /* status banner already shows the problem */ }
}

async function loadBooks() {
    const q = $("searchInput").value.trim();
    const genre = $("genreFilter").value;
    $("loadingState").classList.remove("d-none");
    try {
        if ($("lowStockOnly").checked) {
            books = await api("/books/low-stock");
        } else if (q) {
            books = await api(`/books/search?query=${encodeURIComponent(q)}`);
        } else {
            books = await api(`/books${genre ? `?genre=${encodeURIComponent(genre)}` : ""}`);
        }
        // Genre filter also applies on top of search / low-stock results
        if (genre && (q || $("lowStockOnly").checked)) {
            books = books.filter(b => b.genre === genre);
        }
        renderTable();
    } catch (err) {
        books = [];
        renderTable();
        showAlert("Could not load books: " + err.message, "danger");
    } finally {
        $("loadingState").classList.add("d-none");
    }
}

async function refreshAll() {
    await Promise.all([loadStats(), loadBooks()]);
}

// ---------- Rendering ----------
function availabilityBadge(b) {
    const cls = b.availableCopies === 0 ? "badge-danger" : b.availableCopies <= 1 ? "badge-warning" : "badge-success";
    const pct = b.totalCopies ? Math.round((b.availableCopies / b.totalCopies) * 100) : 0;
    return `<span class="badge ${cls} avail">${b.availableCopies} / ${b.totalCopies}</span>
            <div class="copies-bar"><span style="width:${pct}%"></span></div>`;
}

function renderTable() {
    $("noRecords").classList.toggle("d-none", books.length > 0);
    tableBody.innerHTML = books.map(b => `
        <tr>
            <td>
                <div class="book-title">${escapeHtml(b.title)}</div>
                <div class="book-author">${escapeHtml(b.author)}${b.publishedYear ? " · " + b.publishedYear : ""}${b.shelfLocation ? " · Shelf " + escapeHtml(b.shelfLocation) : ""}</div>
            </td>
            <td><code>${escapeHtml(b.isbn)}</code></td>
            <td><span class="badge badge-genre">${escapeHtml(b.genre)}</span></td>
            <td>${availabilityBadge(b)}</td>
            <td class="rating">${b.rating != null ? "★ " + Number(b.rating).toFixed(1) : "—"}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-primary btn-sm" data-action="issue" data-id="${b.id}" ${b.availableCopies === 0 ? "disabled" : ""}>Issue</button>
                    <button class="btn btn-secondary btn-sm" data-action="return" data-id="${b.id}" ${b.availableCopies >= b.totalCopies ? "disabled" : ""}>Return</button>
                    <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${b.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete" data-id="${b.id}">Delete</button>
                </div>
            </td>
        </tr>`).join("");
}

function renderBreakdown(rows) {
    const max = Math.max(1, ...rows.map(r => Number(r.titles)));
    $("genreBreakdown").innerHTML = rows.length ? rows.map(r => `
        <li>
            <div class="row"><span>${escapeHtml(r.genre)}</span><span>${r.titles} title${r.titles == 1 ? "" : "s"} · ${r.copies} copies</span></div>
            <div class="bar"><span style="width:${(Number(r.titles) / max) * 100}%"></span></div>
        </li>`).join("") : `<li class="hint">No books yet.</li>`;
}

function refreshGenreFilter(genres) {
    const sel = $("genreFilter");
    const current = sel.value;
    sel.innerHTML = `<option value="">All Genres</option>` +
        [...genres].sort().map(g => `<option ${g === current ? "selected" : ""}>${escapeHtml(g)}</option>`).join("");
}

// ---------- Modal (Add + Edit share one form) ----------
function clearErrors() {
    form.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    form.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
}

function showFieldErrors(fieldErrors) {
    Object.entries(fieldErrors).forEach(([field, msg]) => {
        const span = form.querySelector(`[data-error="${field}"]`);
        if (span) span.textContent = msg;
        form.elements[field]?.classList.add("input-error");
    });
}

function openModal(book = null) {
    form.reset();
    clearErrors();
    $("bookId").value = book?.id ?? "";
    $("modalTitle").textContent = book ? "Edit Book" : "Add Book";
    $("saveBtn").textContent = book ? "Update Book" : "Save Book";
    if (book) {
        ["title", "author", "isbn", "genre", "publishedYear", "totalCopies", "rating", "shelfLocation"]
            .forEach(f => form.elements[f].value = book[f] ?? "");
    }
    modal.classList.remove("d-none");
    $("title").focus();
}

function closeModal() {
    modal.classList.add("d-none");
}

// Client-side validation mirrors the server's Bean Validation rules
function validate(book) {
    const errors = {};
    if (!book.title || book.title.length < 2) errors.title = "Title must be at least 2 characters";
    if (!book.author || book.author.length < 3) errors.author = "Author must be at least 3 characters";
    if (!/^97[89]\d{10}$/.test(book.isbn)) errors.isbn = "13 digits starting with 978 or 979";
    if (!book.genre) errors.genre = "Genre is required";
    if (!Number.isInteger(book.totalCopies) || book.totalCopies < 1 || book.totalCopies > 100) errors.totalCopies = "1 to 100 copies";
    if (book.rating != null && (book.rating < 0 || book.rating > 5)) errors.rating = "Rating must be between 0 and 5";
    return errors;
}

form.addEventListener("submit", async e => {
    e.preventDefault();
    clearErrors();

    const num = v => v === "" ? null : Number(v);
    const book = {
        title: form.elements.title.value.trim(),
        author: form.elements.author.value.trim(),
        isbn: form.elements.isbn.value.replace(/[-\s]/g, ""),
        genre: form.elements.genre.value.trim(),
        publishedYear: num(form.elements.publishedYear.value),
        totalCopies: num(form.elements.totalCopies.value),
        rating: num(form.elements.rating.value),
        shelfLocation: form.elements.shelfLocation.value.trim() || null
    };

    const errors = validate(book);
    if (Object.keys(errors).length) {
        showFieldErrors(errors);
        return;
    }

    const id = $("bookId").value;
    const btn = $("saveBtn");
    btn.disabled = true;
    try {
        const saved = await api(id ? `/books/${id}` : "/books", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(book)
        });
        closeModal();
        showAlert(`"${saved.title}" ${id ? "updated" : "added"} successfully.`);
        await refreshAll();
    } catch (err) {
        showFieldErrors(err.fieldErrors);
        $("formError").textContent = err.message;
    } finally {
        btn.disabled = false;
    }
});

// ---------- Table actions (event delegation) ----------
tableBody.addEventListener("click", async e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const book = books.find(b => b.id === id);
    const action = btn.dataset.action;

    try {
        if (action === "edit") {
            openModal(await api(`/books/${id}`));
            return;
        }
        if (action === "delete") {
            if (!confirm(`Delete "${book.title}" permanently?`)) return;
            await api(`/books/${id}`, { method: "DELETE" });
            showAlert(`"${book.title}" deleted.`, "danger");
        }
        if (action === "issue") {
            const b = await api(`/books/${id}/issue`, { method: "PATCH" });
            showAlert(`Issued a copy of "${b.title}" — ${b.availableCopies} left.`, "info");
        }
        if (action === "return") {
            const b = await api(`/books/${id}/return`, { method: "PATCH" });
            showAlert(`Returned a copy of "${b.title}".`);
        }
        await refreshAll();
    } catch (err) {
        showAlert(err.message, "danger");
    }
});

// ---------- Other events ----------
$("openAddBtn").addEventListener("click", () => openModal());
modal.addEventListener("click", e => {
    if (e.target === modal || e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// Debounced server-side search
$("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadBooks, 300);
});
$("genreFilter").addEventListener("change", loadBooks);
$("lowStockOnly").addEventListener("change", loadBooks);

if (API_BASE) $("swaggerLink").href = `${API_BASE}/swagger-ui.html`;

// ---------- Start ----------
checkStatus();
refreshAll();
