// =====================================================
// BookNest - Unit 2: Client-side JavaScript
// Topics: DOM manipulation, events, form validation,
//         array methods, live search, localStorage
// =====================================================

const STORAGE_KEY = "booknest_books";

// Sample initial data
const initialBooks = [
    { id: 1, title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", genre: "Technology", copies: 6 },
    { id: 2, title: "Wings of Fire", author: "A. P. J. Abdul Kalam", isbn: "9788173711466", genre: "Biography", copies: 8 },
    { id: 3, title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", genre: "Fiction", copies: 5 },
    { id: 4, title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", genre: "Science", copies: 4 },
    { id: 5, title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", genre: "History", copies: 3 }
];

// Load from localStorage, fall back to sample data
function loadBooks() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) { /* corrupted storage – ignore */ }
    return [...initialBooks];
}

let books = loadBooks();

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
saveBooks();

// DOM Elements
const bookForm = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const isbnInput = document.getElementById("isbn");
const genreSelect = document.getElementById("genre");
const copiesInput = document.getElementById("copies");
const resetBtn = document.getElementById("resetBtn");
const resetDataBtn = document.getElementById("resetDataBtn");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const tableBody = document.getElementById("bookTableBody");
const noRecords = document.getElementById("noRecords");
const alertBox = document.getElementById("alertBox");

// ---------- Helpers ----------
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showAlert(message, type = "success") {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    clearTimeout(showAlert.timer);
    showAlert.timer = setTimeout(() => alertBox.className = "alert d-none", 3000);
}

function statusBadge(copies) {
    if (copies === 0) return `<span class="badge badge-danger">All Issued</span>`;
    if (copies <= 3) return `<span class="badge badge-warning">${copies} left</span>`;
    return `<span class="badge badge-success">${copies}</span>`;
}

// ISBN-13 checksum: digits weighted 1,3,1,3... must sum to a multiple of 10
function isValidIsbn13(isbn) {
    if (!/^97[89]\d{10}$/.test(isbn)) return false;
    const sum = [...isbn].reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
    return sum % 10 === 0;
}

// ---------- Rendering ----------
function updateStats() {
    document.getElementById("totalCount").textContent = books.length;
    document.getElementById("copiesCount").textContent = books.reduce((t, b) => t + Number(b.copies), 0);
    document.getElementById("genreCount").textContent = new Set(books.map(b => b.genre)).size;
}

function refreshGenreFilter() {
    const current = genreFilter.value;
    const genres = [...new Set(books.map(b => b.genre))].sort();
    genreFilter.innerHTML = `<option value="">All Genres</option>` +
        genres.map(g => `<option ${g === current ? "selected" : ""}>${escapeHtml(g)}</option>`).join("");
}

function renderTable(list) {
    tableBody.innerHTML = "";
    noRecords.classList.toggle("d-none", list.length > 0);

    list.forEach((book, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><div class="book-title">${escapeHtml(book.title)}</div><div class="book-author">${escapeHtml(book.author)}</div></td>
            <td><code>${escapeHtml(book.isbn)}</code></td>
            <td><span class="badge badge-genre">${escapeHtml(book.genre)}</span></td>
            <td>${statusBadge(Number(book.copies))}</td>
            <td><button class="btn btn-danger btn-sm" data-id="${book.id}">Delete</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const g = genreFilter.value;
    const filtered = books.filter(b =>
        (!g || b.genre === g) &&
        (!q || b.title.toLowerCase().includes(q) ||
               b.author.toLowerCase().includes(q) ||
               b.isbn.includes(q))
    );
    renderTable(filtered);
}

function refreshAll() {
    updateStats();
    refreshGenreFilter();
    applyFilters();
}

// ---------- Validation ----------
function setError(input, id, msg) {
    document.getElementById(id).textContent = msg;
    input.classList.add("input-error");
}

function validateForm() {
    let isValid = true;
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));

    const title = titleInput.value.trim();
    if (!title) { setError(titleInput, "titleError", "Book title is required."); isValid = false; }
    else if (title.length < 2) { setError(titleInput, "titleError", "Title must be at least 2 characters."); isValid = false; }

    const author = authorInput.value.trim();
    if (!author) { setError(authorInput, "authorError", "Author name is required."); isValid = false; }
    else if (!/^[A-Za-z .'-]{3,}$/.test(author)) { setError(authorInput, "authorError", "Use letters only (min 3 characters)."); isValid = false; }

    const isbn = isbnInput.value.replace(/[-\s]/g, "");
    if (!isbn) { setError(isbnInput, "isbnError", "ISBN is required."); isValid = false; }
    else if (!isValidIsbn13(isbn)) { setError(isbnInput, "isbnError", "Invalid ISBN-13 (13 digits, 978/979, valid check digit)."); isValid = false; }
    else if (books.some(b => b.isbn === isbn)) { setError(isbnInput, "isbnError", "A book with this ISBN already exists."); isValid = false; }

    if (!genreSelect.value) { setError(genreSelect, "genreError", "Please select a genre."); isValid = false; }

    const copies = Number(copiesInput.value);
    if (!Number.isInteger(copies) || copies < 1 || copies > 50) {
        setError(copiesInput, "copiesError", "Copies must be a whole number between 1 and 50."); isValid = false;
    }
    return isValid;
}

// ---------- Event handlers ----------
bookForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!validateForm()) {
        showAlert("Please fix the highlighted errors.", "danger");
        return;
    }
    const newBook = {
        id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
        title: titleInput.value.trim(),
        author: authorInput.value.trim(),
        isbn: isbnInput.value.replace(/[-\s]/g, ""),
        genre: genreSelect.value,
        copies: Number(copiesInput.value)
    };
    books.push(newBook);
    saveBooks();
    refreshAll();
    bookForm.reset();
    showAlert(`"${newBook.title}" added to the catalogue.`);
});

// Event delegation for delete buttons
tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const book = books.find(b => b.id === id);
    if (book && confirm(`Delete "${book.title}"?`)) {
        books = books.filter(b => b.id !== id);
        saveBooks();
        refreshAll();
        showAlert(`"${book.title}" removed.`, "danger");
    }
});

resetBtn.addEventListener("click", () => {
    bookForm.reset();
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
});

resetDataBtn.addEventListener("click", () => {
    if (!confirm("Replace current data with the sample books?")) return;
    books = [...initialBooks];
    saveBooks();
    refreshAll();
    showAlert("Sample data restored.", "info");
});

searchInput.addEventListener("input", applyFilters);
genreFilter.addEventListener("change", applyFilters);

// Initial render
refreshAll();
