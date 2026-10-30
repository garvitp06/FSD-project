package com.booknest.library.service;

import com.booknest.library.entity.Book;
import com.booknest.library.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;

    // Constructor injection (preferred over field @Autowired)
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book addBook(Book book) {
        if (book.getTitle() == null || book.getTitle().isBlank()
                || book.getAuthor() == null || book.getAuthor().isBlank()
                || book.getIsbn() == null || book.getGenre() == null || book.getGenre().isBlank()) {
            throw new IllegalArgumentException("Title, Author, ISBN and Genre are required.");
        }
        String isbn = book.getIsbn().replaceAll("[-\\s]", "");
        if (!isbn.matches("97[89]\\d{10}")) {
            throw new IllegalArgumentException("ISBN must be 13 digits starting with 978 or 979.");
        }
        if (bookRepository.existsByIsbn(isbn)) {
            throw new IllegalArgumentException("A book with this ISBN already exists.");
        }
        if (book.getCopies() == null || book.getCopies() < 1) {
            book.setCopies(1);
        }
        book.setId(null);
        book.setIsbn(isbn);
        book.setTitle(book.getTitle().trim());
        book.setAuthor(book.getAuthor().trim());
        return bookRepository.save(book);
    }

    public boolean deleteBook(int id) {
        if (!bookRepository.existsById(id)) {
            return false;
        }
        bookRepository.deleteById(id);
        return true;
    }
}
