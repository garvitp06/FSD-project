-- ===================================================
-- Unit 3: MySQL Database Setup for BookNest Library
-- ===================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    author      VARCHAR(120) NOT NULL,
    isbn        CHAR(13)     NOT NULL UNIQUE,
    genre       VARCHAR(50)  NOT NULL,
    copies      INT          NOT NULL DEFAULT 1 CHECK (copies >= 0),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (title, author, isbn, genre, copies) VALUES
('Clean Code',               'Robert C. Martin',     '9780132350884', 'Technology', 6),
('Wings of Fire',            'A. P. J. Abdul Kalam', '9788173711466', 'Biography',  8),
('The Alchemist',            'Paulo Coelho',         '9780062315007', 'Fiction',    5),
('A Brief History of Time',  'Stephen Hawking',      '9780553380163', 'Science',    4),
('Sapiens',                  'Yuval Noah Harari',    '9780062316097', 'History',    3);

-- Handy queries to try in the MySQL shell
-- SELECT * FROM books ORDER BY title;
-- SELECT genre, COUNT(*) AS titles, SUM(copies) AS copies FROM books GROUP BY genre;
