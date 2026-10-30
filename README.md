# 📚 BookNest – Library Management System

A 5-unit progressive full-stack project that grows from static web pages into a complete
Spring Boot + MySQL application with full CRUD, search, statistics, issue/return and Swagger docs.

---

## 📁 Unit Overview

| Unit | Title | Technologies | What it does |
| :--- | :--- | :--- | :--- |
| **[Unit 1](./unit-1)** | Frontend Basics | HTML5, CSS3 | Static library dashboard, book catalogue table and "Add Book" form. |
| **[Unit 2](./unit-2)** | Client-side Scripting | HTML5, CSS3, JavaScript | Form validation (incl. ISBN-13 checksum), dynamic DOM table, live search, genre filter, localStorage. |
| **[Unit 3](./unit-3)** | Database Connectivity | HTML, CSS, JS, MySQL, Node.js/Express | Website reads/writes the `library_db` MySQL database through an Express connector. |
| **[Unit 4](./unit-4)** | Backend Integration | Spring Boot 3, REST API, Spring Data JPA, MySQL | Spring Boot REST backend (`port 8081`) serving and powering the website. |
| **[Unit 5](./unit-5)** | Full CRUD Final Project | Spring Boot 3, JPA, Bean Validation, MySQL, Swagger | Complete app: Create/Read/Update/Delete, search, issue/return, live dashboard & API docs. |

---

## 🧭 Topics covered per unit

| Unit | Topics practised |
| :--- | :--- |
| 1 | Semantic HTML (`header`, `nav`, `main`, `section`, `article`), tables, forms (text, number, select, radio, textarea, `pattern`/`min`/`max`), CSS variables, Flexbox, Grid, responsive media queries, badges & cards |
| 2 | DOM selection & creation, events, event delegation, form validation with regex, array methods (`filter`, `map`, `reduce`, `some`), `Set`, template literals, `localStorage` + JSON, XSS-safe rendering |
| 3 | MySQL DDL (`CREATE TABLE`, `UNIQUE`, `CHECK`), seed data, Express routes, connection pool, parameterised queries (SQL-injection safe), aggregate `GROUP BY` queries, `fetch` + `async/await`, error codes (`ER_DUP_ENTRY`) |
| 4 | Spring Boot project structure, `@Entity`, `JpaRepository`, derived query methods, `@Service`, `@RestController`, `@GetMapping/@PostMapping/@DeleteMapping`, `ResponseEntity`, CORS, `CommandLineRunner` seeding, static resources |
| 5 | Full CRUD with `@PutMapping` & `@PatchMapping`, Bean Validation (`@Valid`, `@NotBlank`, `@Pattern`, `@Min`…), `@RestControllerAdvice` global error handling, custom exceptions, JPQL `@Query` search + aggregate query, `@Transactional`, JPA lifecycle callbacks (`@PrePersist`), Swagger/OpenAPI, modal-based UI |

---

## 🚀 Quick Start by Unit

* **Unit 1:** Open `unit-1/index.html` in your browser.
* **Unit 2:** Open `unit-2/index.html` in your browser.
* **Unit 3:** `mysql -u root -p < unit-3/db.sql`, then in `unit-3/`: `npm install && npm start` → `http://localhost:3000`
* **Unit 4:** In `unit-4/`: `mvn spring-boot:run` → `http://localhost:8081`
* **Unit 5:** In `unit-5/`: `mvn spring-boot:run` → `http://localhost:8081` (Swagger: `/swagger-ui.html`)

> **No MySQL installed?** Units 4 and 5 also run on an in-memory H2 database:
> `mvn spring-boot:run -Dspring-boot.run.profiles=h2`

> **MySQL password:** set the `DB_PASSWORD` environment variable, or edit `application.properties` (Units 4–5) / `server.js` (Unit 3).
