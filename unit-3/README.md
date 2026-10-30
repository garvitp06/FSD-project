# Unit 3: BookNest Library (Connecting MySQL with Website)

Connects a MySQL database (`library_db`) to the website through a lightweight Node.js / Express connector.

## Prerequisites
* MySQL Server running on port 3306
* Node.js 18+

## Setup Steps

### 1. Create the MySQL database
```bash
mysql -u root -p < db.sql
```
*(Creates `library_db` and the `books` table with 5 sample books.)*

### 2. Configure credentials
Either set environment variables (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`) or edit `server.js`:
```javascript
password: process.env.DB_PASSWORD || 'your_mysql_password'
```

### 3. Install & start
```bash
npm install
npm start
```

### 4. Open the website
```
http://localhost:3000
```
Books added or deleted on the page are written straight to MySQL.

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/status` | Checks the MySQL connection |
| GET | `/api/books` | All books (optional `?genre=Fiction`) |
| GET | `/api/books/summary` | Totals + per-genre counts (`GROUP BY`) |
| POST | `/api/books` | Insert a book |
| DELETE | `/api/books/:id` | Delete a book |

All queries use `?` placeholders (parameterised) to prevent SQL injection.
