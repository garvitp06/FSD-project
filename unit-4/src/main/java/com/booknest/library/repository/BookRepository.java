package com.booknest.library.repository;

import com.booknest.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    // Derived query method – Spring generates: SELECT ... WHERE isbn = ?
    boolean existsByIsbn(String isbn);
}
