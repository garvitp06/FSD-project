package com.booknest.library.loader;

import com.booknest.library.entity.Book;
import com.booknest.library.repository.BookRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// Runs once at startup and seeds sample books if the table is empty
@Component
public class DataLoader implements CommandLineRunner {

    private final BookRepository bookRepository;

    public DataLoader(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) {
            return;
        }
        List<Book> books = List.of(
                new Book("Clean Code", "Robert C. Martin", "9780132350884", "Technology", 6),
                new Book("Wings of Fire", "A. P. J. Abdul Kalam", "9788173711466", "Biography", 8),
                new Book("The Alchemist", "Paulo Coelho", "9780062315007", "Fiction", 5),
                new Book("A Brief History of Time", "Stephen Hawking", "9780553380163", "Science", 4),
                new Book("Sapiens", "Yuval Noah Harari", "9780062316097", "History", 3)
        );
        bookRepository.saveAll(books);
        System.out.println(">> Unit 4: Seeded " + books.size() + " sample books.");
    }
}
