package quiz_portal_backend.controller;

import quiz_portal_backend.entity.Quiz;
import quiz_portal_backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;


    // সব কুইজ
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }


    // শুধু ACTIVE কুইজ
    @GetMapping("/active")
    public ResponseEntity<List<Quiz>> getActiveQuizzes() {
        return ResponseEntity.ok(quizService.getActiveQuizzes());
    }


    // 🔥 কোড দিয়ে কুইজ খোঁজা (নতুন)
    @GetMapping("/code/{code}")
    public ResponseEntity<Quiz> getQuizByCode(@PathVariable String code) {
        return quizService.getQuizByCode(code.toUpperCase())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // ক্যাটাগরি অনুযায়ী
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(quizService.getQuizzesByCategory(categoryId));
    }


    // আইডি দিয়ে একটি
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        return quizService.getQuizById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // নতুন কুইজ
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestBody Quiz quiz,
            @RequestParam Long categoryId) {
        try {
            Quiz saved = quizService.createQuiz(quiz, categoryId);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // আপডেট
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(
            @PathVariable Long id,
            @RequestBody Quiz quiz) {
        try {
            Quiz updated = quizService.updateQuiz(id, quiz);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // 🔥 কোড regenerate (নতুন)
    @PutMapping("/{id}/regenerate-code")
    public ResponseEntity<Quiz> regenerateCode(@PathVariable Long id) {
        try {
            Quiz updated = quizService.regenerateCode(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // ডিলিট
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        try {
            quizService.deleteQuiz(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}