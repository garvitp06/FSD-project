// =====================================================
// BookNest - Unit 3: Connecting MySQL with the Website
// Node.js + Express acts as a thin connector between the
// browser (public/) and the MySQL database (library_db).
// =====================================================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection configuration (override with environment variables)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_mysql_password',
    database: process.env.DB_NAME || 'library_db',
    port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(dbConfig);
const db = pool.promise();

const ISBN_REGEX = /^97[89]\d{10}$/;

// ---------- Status ----------
app.get('/api/status', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ connected: true, message: 'Connected to MySQL database: ' + dbConfig.database });
    } catch (err) {
        res.status(500).json({
            connected: false,
            message: 'MySQL Connection Error: ' + err.message,
            tip: 'Check that MySQL is running and the credentials in server.js are correct.'
        });
    }
});

// ---------- READ all books (optional ?genre= filter) ----------
app.get('/api/books', async (req, res) => {
    try {
        const { genre } = req.query;
        const sql = genre
            ? 'SELECT id, title, author, isbn, genre, copies FROM books WHERE genre = ? ORDER BY id'
            : 'SELECT id, title, author, isbn, genre, copies FROM books ORDER BY id';
        const [rows] = await db.query(sql, genre ? [genre] : []);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database query failed: ' + err.message });
    }
});

// ---------- Summary using GROUP BY / aggregate functions ----------
app.get('/api/books/summary', async (req, res) => {
    try {
        const [[totals]] = await db.query(
            'SELECT COUNT(*) AS totalTitles, COALESCE(SUM(copies),0) AS totalCopies, COUNT(DISTINCT genre) AS totalGenres FROM books'
        );
        const [byGenre] = await db.query(
            'SELECT genre, COUNT(*) AS titles, SUM(copies) AS copies FROM books GROUP BY genre ORDER BY titles DESC'
        );
        res.json({ ...totals, byGenre });
    } catch (err) {
        res.status(500).json({ error: 'Database query failed: ' + err.message });
    }
});

// ---------- CREATE a book ----------
app.post('/api/books', async (req, res) => {
    const { title, author, isbn, genre } = req.body;
    const copies = Number(req.body.copies ?? 1);
    const cleanIsbn = String(isbn || '').replace(/[-\s]/g, '');

    if (!title || !author || !cleanIsbn || !genre) {
        return res.status(400).json({ error: 'Title, Author, ISBN and Genre are required.' });
    }
    if (!ISBN_REGEX.test(cleanIsbn)) {
        return res.status(400).json({ error: 'ISBN must be 13 digits starting with 978 or 979.' });
    }
    if (!Number.isInteger(copies) || copies < 1 || copies > 50) {
        return res.status(400).json({ error: 'Copies must be between 1 and 50.' });
    }

    try {
        // Parameterised query (?) prevents SQL injection
        const [result] = await db.query(
            'INSERT INTO books (title, author, isbn, genre, copies) VALUES (?, ?, ?, ?, ?)',
            [title.trim(), author.trim(), cleanIsbn, genre.trim(), copies]
        );
        res.status(201).json({
            id: result.insertId, title, author, isbn: cleanIsbn, genre, copies,
            message: 'Book inserted into MySQL successfully!'
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A book with this ISBN already exists.' });
        }
        res.status(500).json({ error: 'Failed to insert book: ' + err.message });
    }
});

// ---------- DELETE a book ----------
app.delete('/api/books/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Book not found.' });
        }
        res.json({ message: 'Book deleted from MySQL successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete book: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log('====================================================');
    console.log('BookNest Library (Unit 3 - MySQL Connector)');
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`Target Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
    console.log('====================================================');
});
