package quiz_portal_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkQuestionRequest {

    private Long quizId;
    private List<QuestionItem> questions;

    @Data
    public static class QuestionItem {
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
    }
}
