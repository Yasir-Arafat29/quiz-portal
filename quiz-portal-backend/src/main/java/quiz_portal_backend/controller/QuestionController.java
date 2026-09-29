package quiz_portal_backend.controller;

import quiz_portal_backend.dto.BulkQuestionRequest;
import quiz_portal_backend.entity.Question;
import quiz_portal_backend.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

        // সব প্রশ্ন দেখা (GET)
    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    // নির্দিষ্ট কুইজের সব প্রশ্ন (GET)
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<Question>> getQuestionsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionService.getQuestionsByQuiz(quizId));
    }


    // আইডি দিয়ে একটি প্রশ্ন (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return questionService.getQuestionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // নতুন প্রশ্ন তৈরি (POST) – URL-এ quizId দিতে হবে
    @PostMapping
    public ResponseEntity<Question> createQuestion(
            @RequestBody Question question,
            @RequestParam Long quizId) {
        try {
            Question saved = questionService.createQuestion(question, quizId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

        // একসাথে অনেক প্রশ্ন তৈরি (POST)
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> createBulkQuestions(
            @RequestBody BulkQuestionRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
                response.put("success", false);
                response.put("message", "কোনো প্রশ্ন দেওয়া হয়নি।");
                return ResponseEntity.badRequest().body(response);
            }

            List<Question> questions = new ArrayList<>();

            for (BulkQuestionRequest.QuestionItem item : request.getQuestions()) {
                Question q = new Question();
                q.setQuestionText(item.getQuestionText());
                q.setOptionA(item.getOptionA());
                q.setOptionB(item.getOptionB());
                q.setOptionC(item.getOptionC());
                q.setOptionD(item.getOptionD());
                q.setCorrectAnswer(item.getCorrectAnswer());
                questions.add(q);
            }

            List<Question> saved = questionService.createBulkQuestions(request.getQuizId(), questions);

            response.put("success", true);
            response.put("message", saved.size() + "টি প্রশ্ন সফলভাবে যোগ হয়েছে।");
            response.put("count", saved.size());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


    // প্রশ্ন আপডেট (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long id,
            @RequestBody Question question) {
        try {
            Question updated = questionService.updateQuestion(id, question);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // প্রশ্ন মুছে ফেলা (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}