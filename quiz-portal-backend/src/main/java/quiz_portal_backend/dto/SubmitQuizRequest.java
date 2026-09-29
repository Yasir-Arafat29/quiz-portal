package quiz_portal_backend.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SubmitQuizRequest {

    // কোন কুইজ দিচ্ছে
    private Long quizId;

    // কোন ইউজার দিচ্ছে
    private Long userId;

    // ইউজার কত সময় নিয়েছে (সেকেন্ডে)
    private Integer timeTaken;

    // প্রশ্নের id → ইউজারের উত্তর (A, B, C, D)
    // উদাহরণ: { "1": "A", "2": "C", "3": "B" }
    private Map<Long, String> answers;
}