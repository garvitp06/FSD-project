package com.booknest.library.service;

import com.booknest.library.entity.Book;
import com.booknest.library.exception.BusinessRuleException;
import com.booknest.library.exception.ResourceNotFoundException;
import com.booknest.library.repository.BookRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BookService {

    private static final int LOW_STOCK_THRESHOLD = 1;

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // ---------- READ ----------
    public List<Book> getAllBooks(String genre) {
        if (genre != null && !genre.isBlank()) {
            return bookRepository.findByGenreIgnoreCaseOrderByTitleAsc(genre.trim());
        }
        return bookRepository.findAll(Sort.by("id"));
    }

    public Book getBookById(int id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.isBlank()) {
            return bookRepository.findAll(Sort.by("id"));
        }
        return bookRepository.search(query.trim());
    }

    public List<Book> getLowStockBooks() {
        return bookRepository.findByAvailableCopiesLessThanEqualOrderByAvailableCopiesAsc(LOW_STOCK_THRESHOLD);
    }

    // ---------- CREATE ----------
    @Transactional
    public Book createBook(Book book) {
        normalise(book);
        if (bookRepository.existsByIsbn(book.getIsbn())) {
            throw new BusinessRuleException("A book with ISBN " + book.getIsbn() + " already exists.");
        }
        book.setId(null);
        book.setAvailableCopies(book.getTotalCopies());   // new stock is fully on the shelf
        return bookRepository.save(book);
    }

    // ---------- UPDATE ----------
    @Transactional
    public Book updateBook(int id, Book details) {
        Book existing = getBookById(id);
        normalise(details);

        if (bookRepository.existsByIsbnAndIdNot(details.getIsbn(), id)) {
            throw new BusinessRuleException("Another book already uses ISBN " + details.getIsbn() + ".");
        }

        // Keep issued copies consistent when the total stock changes
        int issued = existing.getTotalCopies() - existing.getAvailableCopies();
        if (details.getTotalCopies() < issued) {
            throw new BusinessRuleException("Total copies cannot be less than the " + issued + " copies currently issued.");
        }

        existing.setTitle(details.getTitle());
        existing.setAuthor(details.getAuthor());
        existing.setIsbn(details.getIsbn());
        existing.setGenre(details.getGenre());
        existing.setPublishedYear(details.getPublishedYear());
        existing.setRating(details.getRating());
        existing.setShelfLocation(details.getShelfLocation());
        existing.setTotalCopies(details.getTotalCopies());
        existing.setAvailableCopies(details.getTotalCopies() - issued);
        return bookRepository.save(existing);
    }

    // ---------- DELETE ----------
    @Transactional
    public void deleteBook(int id) {
        Book book = getBookById(id);
        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new BusinessRuleException("Cannot delete \"" + book.getTitle() + "\" while copies are issued. Return them first.");
        }
        bookRepository.delete(book);
    }

    // ---------- ISSUE / RETURN ----------
    @Transactional
    public Book issueBook(int id) {
        Book book = getBookById(id);
        if (book.getAvailableCopies() <= 0) {
            throw new BusinessRuleException("No copies of \"" + book.getTitle() + "\" are available to issue.");
        }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        return bookRepository.save(book);
    }

    @Transactional
    public Book returnBook(int id) {
        Book book = getBookById(id);
        if (book.getAvailableCopies() >= book.getTotalCopies()) {
            throw new BusinessRuleException("All copies of \"" + book.getTitle() + "\" are already on the shelf.");
        }
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        return bookRepository.save(book);
    }

    // ---------- DASHBOARD STATISTICS ----------
    public Map<String, Object> getStatistics() {
        List<Book> all = bookRepository.findAll();

        int totalCopies = all.stream().mapToInt(Book::getTotalCopies).sum();
        int available = all.stream().mapToInt(Book::getAvailableCopies).sum();
        double avgRating = all.stream()
                .filter(b -> b.getRating() != null)
                .mapToDouble(Book::getRating)
                .average().orElse(0.0);

        List<Map<String, Object>> byGenre = new ArrayList<>();
        for (Object[] row : bookRepository.countByGenre()) {
            Map<String, Object> g = new LinkedHashMap<>();
            g.put("genre", row[0]);
            g.put("titles", row[1]);
            g.put("copies", row[2]);
            byGenre.add(g);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalTitles", all.size());
        stats.put("totalCopies", totalCopies);
        stats.put("availableCopies", available);
        stats.put("issuedCopies", totalCopies - available);
        stats.put("totalGenres", byGenre.size());
        stats.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
        stats.put("byGenre", byGenre);
        return stats;
    }

    // Trim text fields and strip hyphens/spaces from the ISBN
    private void normalise(Book b) {
        b.setTitle(b.getTitle().trim());
        b.setAuthor(b.getAuthor().trim());
        b.setGenre(b.getGenre().trim());
        b.setIsbn(b.getIsbn().replaceAll("[-\\s]", ""));
        if (b.getShelfLocation() != null) {
            String s = b.getShelfLocation().trim().toUpperCase();
            b.setShelfLocation(s.isEmpty() ? null : s);
        }
    }
}
