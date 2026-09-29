package quiz_portal_backend.dto;

import lombok.Data;

@Data
public class QuizResultResponse {

    private Long attemptId;
    private Long quizId;
    private String quizTitle;

    private Integer totalQuestions;
    private Integer correct;
    private Integer wrong;
    private Integer skipped;

    private Double percentage;
    private String status;      // PASSED অথবা FAILED
    private Integer timeTaken;
    private String attemptedAt;
}