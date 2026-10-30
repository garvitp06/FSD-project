package com.booknest.library.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 120)
    private String author;

    @Column(nullable = false, unique = true, length = 13)
    private String isbn;

    @Column(nullable = false, length = 50)
    private String genre;

    @Column(nullable = false)
    private Integer copies = 1;

    public Book() {
    }

    public Book(String title, String author, String isbn, String genre, Integer copies) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.genre = genre;
        this.copies = copies;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public Integer getCopies() { return copies; }
    public void setCopies(Integer copies) { this.copies = copies; }

    @Override
    public String toString() {
        return "Book{id=" + id + ", title='" + title + "', author='" + author +
               "', isbn='" + isbn + "', genre='" + genre + "', copies=" + copies + "}";
    }
}
