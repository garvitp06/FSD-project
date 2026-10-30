package com.booknest.library.controller;

import com.booknest.library.entity.Book;
import com.booknest.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Books", description = "CRUD, search, statistics and issue/return for library books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/status")
    @Operation(summary = "Check backend status")
    public Map<String, Object> status() {
        return Map.of(
                "connected", true,
                "message", "BookNest Spring Boot API is running on port 8081",
                "docs", "/swagger-ui.html");
    }

    // ---------- READ ----------
    @GetMapping("/books")
    @Operation(summary = "List all books", description = "Optionally filter by genre, e.g. /api/books?genre=Fiction")
    public List<Book> getAll(@Parameter(description = "Genre filter") @RequestParam(required = false) String genre) {
        return bookService.getAllBooks(genre);
    }

    @GetMapping("/books/{id}")
    @Operation(summary = "Get a book by ID")
    @ApiResponse(responseCode = "404", description = "Book not found")
    public Book getById(@PathVariable int id) {
        return bookService.getBookById(id);
    }

    @GetMapping("/books/search")
    @Operation(summary = "Search by title, author, genre or ISBN")
    public List<Book> search(@RequestParam("query") String query) {
        return bookService.searchBooks(query);
    }

    @GetMapping("/books/low-stock")
    @Operation(summary = "Books with one or zero copies on the shelf")
    public List<Book> lowStock() {
        return bookService.getLowStockBooks();
    }

    @GetMapping("/books/stats")
    @Operation(summary = "Dashboard statistics (totals, issued copies, average rating, genre breakdown)")
    public Map<String, Object> stats() {
        return bookService.getStatistics();
    }

    // ---------- CREATE ----------
    @PostMapping("/books")
    @Operation(summary = "Add a new book")
    @ApiResponse(responseCode = "201", description = "Book created")
    @ApiResponse(responseCode = "400", description = "Validation failed")
    @ApiResponse(responseCode = "409", description = "Duplicate ISBN")
    public ResponseEntity<Book> create(@Valid @RequestBody Book book) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookService.createBook(book));
    }

    // ---------- UPDATE ----------
    @PutMapping("/books/{id}")
    @Operation(summary = "Update an existing book")
    public Book update(@PathVariable int id, @Valid @RequestBody Book book) {
        return bookService.updateBook(id, book);
    }

    // ---------- DELETE ----------
    @DeleteMapping("/books/{id}")
    @Operation(summary = "Delete a book (only when no copies are issued)")
    public Map<String, String> delete(@PathVariable int id) {
        bookService.deleteBook(id);
        return Map.of("message", "Book deleted with ID: " + id);
    }

    // ---------- ISSUE / RETURN ----------
    @PatchMapping("/books/{id}/issue")
    @Operation(summary = "Issue one copy (available - 1)")
    public Book issue(@PathVariable int id) {
        return bookService.issueBook(id);
    }

    @PatchMapping("/books/{id}/return")
    @Operation(summary = "Return one copy (available + 1)")
    public Book returnCopy(@PathVariable int id) {
        return bookService.returnBook(id);
    }
}
