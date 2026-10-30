-- ===================================================
-- Unit 5: Optional MySQL script for BookNest Library
-- (Hibernate creates this table automatically with ddl-auto=update;
--  run this only if you want to create/seed it by hand.)
-- ===================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    author           VARCHAR(120) NOT NULL,
    isbn             VARCHAR(13)  NOT NULL UNIQUE,
    genre            VARCHAR(50)  NOT NULL,
    published_year   INT,
    total_copies     INT          NOT NULL,
    available_copies INT          NOT NULL,
    rating           DOUBLE,
    shelf_location   VARCHAR(20),
    created_at       DATETIME(6),
    updated_at       DATETIME(6),
    CONSTRAINT chk_copies CHECK (available_copies BETWEEN 0 AND total_copies)
);

INSERT INTO books (title, author, isbn, genre, published_year, total_copies, available_copies, rating, shelf_location, created_at, updated_at) VALUES
('Clean Code',                 'Robert C. Martin',     '9780132350884', 'Technology', 2008,  6,  4, 4.4, 'T-04',  NOW(), NOW()),
('Wings of Fire',              'A. P. J. Abdul Kalam', '9788173711466', 'Biography',  1999,  8,  7, 4.7, 'B-01',  NOW(), NOW()),
('The Alchemist',              'Paulo Coelho',         '9780062315007', 'Fiction',    1988,  5,  2, 4.0, 'F-11',  NOW(), NOW()),
('A Brief History of Time',    'Stephen Hawking',      '9780553380163', 'Science',    1988,  4,  4, 4.2, 'S-02',  NOW(), NOW()),
('Introduction to Algorithms', 'Thomas H. Cormen',     '9780262046305', 'Technology', 2022, 10,  9, 4.6, 'T-01',  NOW(), NOW()),
('Sapiens',                    'Yuval Noah Harari',    '9780062316097', 'History',    2015,  3,  1, 4.5, 'H-07',  NOW(), NOW()),
('Atomic Habits',              'James Clear',          '9780735211292', 'Self-Help',  2018,  5,  0, 4.8, 'SH-03', NOW(), NOW()),
('Godaan',                     'Munshi Premchand',     '9788171674503', 'Fiction',    1936, 10, 10, 4.3, 'F-02',  NOW(), NOW());

-- Useful reporting queries
-- SELECT genre, COUNT(*) titles, SUM(total_copies) copies, SUM(total_copies - available_copies) issued FROM books GROUP BY genre;
-- SELECT title, available_copies FROM books WHERE available_copies <= 1 ORDER BY available_copies;
