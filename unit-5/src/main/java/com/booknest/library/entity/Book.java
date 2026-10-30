package com.booknest.library.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Schema(description = "A book in the BookNest library catalogue")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY, example = "1")
    private Integer id;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be 2-200 characters")
    @Column(nullable = false, length = 200)
    @Schema(example = "Clean Code")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(min = 3, max = 120, message = "Author must be 3-120 characters")
    @Column(nullable = false, length = 120)
    @Schema(example = "Robert C. Martin")
    private String author;

    @NotBlank(message = "ISBN is required")
    @Pattern(regexp = "97[89]\\d{10}", message = "ISBN must be 13 digits starting with 978 or 979")
    @Column(nullable = false, unique = true, length = 13)
    @Schema(example = "9780132350884")
    private String isbn;

    @NotBlank(message = "Genre is required")
    @Column(nullable = false, length = 50)
    @Schema(example = "Technology")
    private String genre;

    @Min(value = 1450, message = "Published year looks too early")
    @Max(value = 2100, message = "Published year looks too late")
    @Schema(example = "2008")
    private Integer publishedYear;

    @NotNull(message = "Total copies is required")
    @Min(value = 1, message = "At least 1 copy is required")
    @Max(value = 100, message = "At most 100 copies allowed")
    @Column(nullable = false)
    @Schema(example = "5")
    private Integer totalCopies = 1;

    @Column(nullable = false)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Copies currently on the shelf", example = "3")
    private Integer availableCopies = 1;

    @DecimalMin(value = "0.0", message = "Rating must be between 0 and 5")
    @DecimalMax(value = "5.0", message = "Rating must be between 0 and 5")
    @Schema(example = "4.4")
    private Double rating;

    @Size(max = 20, message = "Shelf location is too long")
    @Schema(example = "T-04")
    private String shelfLocation;

    @Column(updatable = false)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime createdAt;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private LocalDateTime updatedAt;

    // JPA lifecycle callbacks
    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Book() {
    }

    public Book(String title, String author, String isbn, String genre, Integer publishedYear,
                Integer totalCopies, Integer availableCopies, Double rating, String shelfLocation) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.genre = genre;
        this.publishedYear = publishedYear;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.rating = rating;
        this.shelfLocation = shelfLocation;
    }

    // ---------- Getters & Setters ----------
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

    public Integer getPublishedYear() { return publishedYear; }
    public void setPublishedYear(Integer publishedYear) { this.publishedYear = publishedYear; }

    public Integer getTotalCopies() { return totalCopies; }
    public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }

    public Integer getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getShelfLocation() { return shelfLocation; }
    public void setShelfLocation(String shelfLocation) { this.shelfLocation = shelfLocation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return "Book{id=" + id + ", title='" + title + "', isbn='" + isbn +
               "', available=" + availableCopies + "/" + totalCopies + "}";
    }
}
