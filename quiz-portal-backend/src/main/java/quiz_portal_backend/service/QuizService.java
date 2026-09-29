package quiz_portal_backend.service;

import quiz_portal_backend.entity.Category;
import quiz_portal_backend.entity.Quiz;
import quiz_portal_backend.entity.QuizCodeGenerator;
import quiz_portal_backend.repository.CategoryRepository;
import quiz_portal_backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private CategoryRepository categoryRepository;


    public List<Quiz> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        ensureCodes(quizzes);
        return quizzes;
    }


    public List<Quiz> getActiveQuizzes() {
        List<Quiz> quizzes = quizRepository.findByStatus("ACTIVE");
        ensureCodes(quizzes);
        return quizzes;
    }


    public List<Quiz> getQuizzesByCategory(Long categoryId) {
        return quizRepository.findByCategoryId(categoryId);
    }


    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }


    // 🔥 কোড দিয়ে কুইজ খোঁজা
    public Optional<Quiz> getQuizByCode(String code) {
        return quizRepository.findByQuizCode(code);
    }


    public Quiz createQuiz(Quiz quiz, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("ক্যাটাগরি খুঁজে পাওয়া যায়নি"));
        quiz.setCategory(category);
        return quizRepository.save(quiz);
    }


    public Quiz updateQuiz(Long id, Quiz quizDetails) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("কুইজ খুঁজে পাওয়া যায়নি"));

        quiz.setTitle(quizDetails.getTitle());
        quiz.setDescription(quizDetails.getDescription());
        quiz.setTimeLimit(quizDetails.getTimeLimit());
        quiz.setTotalQuestions(quizDetails.getTotalQuestions());
        quiz.setStatus(quizDetails.getStatus());

        return quizRepository.save(quiz);
    }


    // 🔥 কোড আবার generate
    public Quiz regenerateCode(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("কুইজ খুঁজে পাওয়া যায়নি"));

        quiz.setQuizCode(QuizCodeGenerator.generate(quiz.getTitle()));
        return quizRepository.save(quiz);
    }


    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }


    // পুরোনো কুইজের কোড না থাকলে generate করো
    private void ensureCodes(List<Quiz> quizzes) {
        boolean anyUpdated = false;
        for (Quiz q : quizzes) {
            if (q.getQuizCode() == null || q.getQuizCode().isEmpty()) {
                q.setQuizCode(QuizCodeGenerator.generate(q.getTitle()));
                quizRepository.save(q);
                anyUpdated = true;
            }
        }
    }
}