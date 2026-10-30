# Unit 5: BookNest Library (Final Full-Stack Project)

A complete full-stack application: Spring Boot 3 REST API, Spring Data JPA, MySQL, Bean Validation,
global error handling, Swagger docs and an interactive web frontend with full CRUD and issue/return.

## Prerequisites
* Java 17 or 21
* Maven
* MySQL on port 3306 (or use the H2 profile)

## How to Run

### 1. Database (optional)
Hibernate creates the `books` table automatically. To create and seed it by hand instead:
```bash
mysql -u root -p < database.sql
```

### 2. Credentials
Set `DB_PASSWORD` or edit `src/main/resources/application.properties`.

### 3. Start
```bash
mvn spring-boot:run
# or without MySQL:
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### 4. Open
* **Web app:** `http://localhost:8081`
* **Swagger UI:** `http://localhost:8081/swagger-ui.html`
* **H2 console (h2 profile):** `http://localhost:8081/h2-console` (JDBC URL `jdbc:h2:mem:library_db`)

## Features
* **Create (POST)** – add a book from a modal form; validated in the browser *and* on the server.
* **Read (GET)** – catalogue, book by ID, server-side search, genre filter, low-stock view.
* **Update (PUT)** – edit any book; available copies stay consistent with copies currently issued.
* **Delete (DELETE)** – blocked while copies are still issued.
* **Issue / Return (PATCH)** – one click moves a copy off or back onto the shelf.
* **Dashboard** – titles, total copies, issued copies, average rating, collection-by-genre bars.

## Project Structure
```
com.booknest.library
├── config/OpenApiConfig            # Swagger title/description
├── entity/Book                     # JPA entity + Bean Validation + @PrePersist/@PreUpdate timestamps
├── repository/BookRepository       # derived queries, JPQL search, GROUP BY aggregate
├── service/BookService             # business rules, @Transactional, statistics
├── controller/BookController       # REST endpoints with OpenAPI annotations
├── exception/                      # ResourceNotFound, BusinessRule, GlobalExceptionHandler
└── loader/DataLoader               # seeds 8 sample books
```

## REST API
| Method | Endpoint | Description | Errors |
| :--- | :--- | :--- | :--- |
| GET | `/api/status` | Backend status | |
| GET | `/api/books?genre=` | All books / by genre | |
| GET | `/api/books/{id}` | One book | 404 |
| GET | `/api/books/search?query=` | Search title, author, genre, ISBN | |
| GET | `/api/books/low-stock` | Books with ≤ 1 copy on the shelf | |
| GET | `/api/books/stats` | Dashboard statistics | |
| POST | `/api/books` | Create | 400 validation, 409 duplicate ISBN |
| PUT | `/api/books/{id}` | Update | 400, 404, 409 |
| DELETE | `/api/books/{id}` | Delete | 404, 409 copies issued |
| PATCH | `/api/books/{id}/issue` | Issue one copy | 404, 409 none available |
| PATCH | `/api/books/{id}/return` | Return one copy | 404, 409 all on shelf |

Example error body (from `GlobalExceptionHandler`):
```json
{
  "timestamp": "2026-10-30T12:00:00",
  "status": 400,
  "error": "ISBN must be 13 digits starting with 978 or 979",
  "fieldErrors": { "isbn": "ISBN must be 13 digits starting with 978 or 979" }
}
```
