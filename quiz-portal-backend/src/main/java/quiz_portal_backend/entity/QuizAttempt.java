package quiz_portal_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // কোন ইউজার দিয়েছে
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties
    private User user;

    // কোন কুইজ দিয়েছে
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnoreProperties
    private Quiz quiz;

    // ফলাফল
    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer correct;

    @Column(nullable = false)
    private Integer wrong;

    @Column(nullable = false)
    private Integer skipped;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private String status;  // PASSED অথবা FAILED

    private Integer timeTaken;  // সেকেন্ডে

    private LocalDateTime attemptedAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String answers;  // ইউজারের সব উত্তর (JSON ফরম্যাটে)
}