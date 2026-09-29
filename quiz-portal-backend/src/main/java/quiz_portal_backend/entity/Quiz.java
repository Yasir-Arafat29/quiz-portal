package quiz_portal_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Integer timeLimit;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private String status = "ACTIVE";

    // 🔥 নতুন: শেয়ারযোগ্য কোড
    @Column(unique = true)
    private String quizCode;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz")
    @JsonIgnore
    private List<QuizAttempt> attempts = new ArrayList<>();


    // 🎯 নতুন কুইজ সেভ হওয়ার আগে অটো কোড generate হবে
    @PrePersist
    public void generateCode() {
        if (this.quizCode == null || this.quizCode.isEmpty()) {
            this.quizCode = QuizCodeGenerator.generate(this.title);
        }
    }
}