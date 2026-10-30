package com.booknest.library.loader;

import com.booknest.library.entity.Book;
import com.booknest.library.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final BookRepository bookRepository;

    public DataLoader(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (bookRepository.count() > 0) {
                return;
            }
            List<Book> books = List.of(
                new Book("Clean Code", "Robert C. Martin", "9780132350884", "Technology", 2008, 6, 4, 4.4, "T-04"),
                new Book("Wings of Fire", "A. P. J. Abdul Kalam", "9788173711466", "Biography", 1999, 8, 7, 4.7, "B-01"),
                new Book("The Alchemist", "Paulo Coelho", "9780062315007", "Fiction", 1988, 5, 2, 4.0, "F-11"),
                new Book("A Brief History of Time", "Stephen Hawking", "9780553380163", "Science", 1988, 4, 4, 4.2, "S-02"),
                new Book("Introduction to Algorithms", "Thomas H. Cormen", "9780262046305", "Technology", 2022, 10, 9, 4.6, "T-01"),
                new Book("Sapiens", "Yuval Noah Harari", "9780062316097", "History", 2015, 3, 1, 4.5, "H-07"),
                new Book("Atomic Habits", "James Clear", "9780735211292", "Self-Help", 2018, 5, 0, 4.8, "SH-03"),
                new Book("Godaan", "Munshi Premchand", "9788171674503", "Fiction", 1936, 10, 10, 4.3, "F-02")
            );
            bookRepository.saveAll(books);
            System.out.println(">> Unit 5: Seeded " + books.size() + " sample books.");
        } catch (Exception e) {
            System.err.println(">> Unit 5 Notice: could not seed data - " + e.getMessage());
        }
    }
}
