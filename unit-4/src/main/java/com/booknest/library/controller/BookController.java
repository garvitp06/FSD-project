package com.booknest.library.controller;

import com.booknest.library.entity.Book;
import com.booknest.library.service.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")   // allows frontend/index.html opened directly from disk
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Health check used by the status banner on the website
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "connected", true,
                "message", "Spring Boot REST API is running on port 8081");
    }

    // GET /api/books -> all books
    @GetMapping("/books")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    // POST /api/books -> add a book
    @PostMapping("/books")
    public ResponseEntity<?> addBook(@RequestBody Book book) {
        try {
            Book saved = bookService.addBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /api/books/{id} -> remove a book
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable int id) {
        if (bookService.deleteBook(id)) {
            return ResponseEntity.ok(Map.of("message", "Book deleted with ID: " + id));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Book not found with ID: " + id));
    }
}
