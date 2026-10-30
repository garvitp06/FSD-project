# Unit 4: BookNest Library (Spring Boot + Website)

Replaces the Express connector with a Spring Boot 3 REST API (`port 8081`) using Spring Data JPA.

## Prerequisites
* Java 17 or 21
* Maven
* MySQL (or use the H2 profile below)

## Project Structure
```
src/main/java/com/booknest/library
├── LibraryApplication.java      # @SpringBootApplication entry point
├── entity/Book.java             # @Entity mapped to the "books" table
├── repository/BookRepository    # JpaRepository + derived query existsByIsbn()
├── service/BookService          # business rules (ISBN format, duplicates)
├── controller/BookController    # @RestController /api/books
└── loader/DataLoader            # CommandLineRunner that seeds sample books
src/main/resources/static/       # website served by Spring Boot
frontend/                        # same website, can be opened directly from disk
```

## Setup Steps

### 1. Database configuration
Set `DB_PASSWORD` (and optionally `DB_USER`) or edit `src/main/resources/application.properties`:
```properties
spring.datasource.password=${DB_PASSWORD:your_password}
```
The `library_db` database is created automatically.

### 2. Run the backend
```bash
mvn spring-boot:run
```
No MySQL? Use the in-memory database:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### 3. Open the website
```
http://localhost:8081
```
*(Or open `frontend/index.html` directly – CORS is enabled.)*

## REST Endpoints
* `GET    /api/status` – backend status
* `GET    /api/books` – all books
* `POST   /api/books` – add a book (400 on invalid/duplicate ISBN)
* `DELETE /api/books/{id}` – delete a book (404 if missing)
