package quiz_portal_backend.controller;

import quiz_portal_backend.dto.QuizResultResponse;
import quiz_portal_backend.dto.SubmitQuizRequest;
import quiz_portal_backend.entity.QuizAttempt;
import quiz_portal_backend.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;


    // কুইজ জমা দেওয়া (POST)
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@RequestBody SubmitQuizRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            QuizResultResponse result = quizAttemptService.submitQuiz(request);

            response.put("success", true);
            response.put("message", "কুইজ সফলভাবে জমা হয়েছে!");
            response.put("data", result);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }


    // একজন ইউজারের সব attempt (GET)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(quizAttemptService.getUserHistory(userId));
    }


    // একটি কুইজের সব attempt (GET)
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getQuizAttempts(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizAttemptService.getQuizAttempts(quizId));
    }


    // সব attempt – অ্যাডমিনের জন্য (GET)
    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(quizAttemptService.getAllAttempts());
    }
}