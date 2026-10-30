package com.booknest.library.repository;

import com.booknest.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    // ---- Derived query methods (Spring builds the SQL from the name) ----
    boolean existsByIsbn(String isbn);

    boolean existsByIsbnAndIdNot(String isbn, Integer id);

    List<Book> findByGenreIgnoreCaseOrderByTitleAsc(String genre);

    List<Book> findByAvailableCopiesLessThanEqualOrderByAvailableCopiesAsc(int threshold);

    // ---- Custom JPQL query ----
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(b.genre)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "b.isbn LIKE CONCAT('%', :q, '%') " +
           "ORDER BY b.title")
    List<Book> search(@Param("q") String q);

    // ---- Aggregate query: one row per genre -> [genre, titles, copies] ----
    @Query("SELECT b.genre, COUNT(b), SUM(b.totalCopies) FROM Book b GROUP BY b.genre ORDER BY COUNT(b) DESC")
    List<Object[]> countByGenre();
}
