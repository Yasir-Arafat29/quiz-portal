package quiz_portal_backend.service;

import quiz_portal_backend.dto.QuizResultResponse;
import quiz_portal_backend.dto.SubmitQuizRequest;
import quiz_portal_backend.entity.Question;
import quiz_portal_backend.entity.Quiz;
import quiz_portal_backend.entity.QuizAttempt;
import quiz_portal_backend.entity.User;
import quiz_portal_backend.repository.QuestionRepository;
import quiz_portal_backend.repository.QuizAttemptRepository;
import quiz_portal_backend.repository.QuizRepository;
import quiz_portal_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;


    // কুইজ জমা দিলে মূল্যায়ন হয়
    public QuizResultResponse submitQuiz(SubmitQuizRequest request) {

        // ১. ইউজার ও কুইজ খুঁজে বের করো
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("ইউজার খুঁজে পাওয়া যায়নি"));

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("কুইজ খুঁজে পাওয়া যায়নি"));

        // ২. কুইজের সব প্রশ্ন আনো
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());

        if (questions.isEmpty()) {
            throw new RuntimeException("এই কুইজে কোনো প্রশ্ন নেই");
        }

        // ৩. ইউজারের উত্তর চেক করো
        Map<Long, String> userAnswers = request.getAnswers();

        int correct = 0;
        int wrong = 0;
        int skipped = 0;

        for (Question q : questions) {
            String userAnswer = userAnswers.get(q.getId());

            if (userAnswer == null || userAnswer.trim().isEmpty()) {
                skipped++;
            } else if (userAnswer.equalsIgnoreCase(q.getCorrectAnswer())) {
                correct++;
            } else {
                wrong++;
            }
        }

        // ৪. স্কোর হিসাব করো
        int total = questions.size();
        double percentage = (correct * 100.0) / total;

        // ৫. PASSED/FAILED ঠিক করো (৫০% বা তার বেশি হলে পাস)
        String status = percentage >= 55.0 ? "PASSED" : "FAILED";

        // ৬. QuizAttempt তৈরি করো
        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setTotalQuestions(total);
        attempt.setCorrect(correct);
        attempt.setWrong(wrong);
        attempt.setSkipped(skipped);
        attempt.setPercentage(percentage);
        attempt.setStatus(status);
        attempt.setTimeTaken(request.getTimeTaken());
        attempt.setAnswers(mapToJson(userAnswers));

        // ৭. ডাটাবেসে সেভ করো
        QuizAttempt saved = quizAttemptRepository.save(attempt);

        // ৮. রেসপন্স তৈরি করো
        return buildResponse(saved);
    }


    // এক ইউজারের সব attempt
    public List<QuizAttempt> getUserHistory(Long userId) {
        return quizAttemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);
    }


    // এক কুইজের সব attempt
    public List<QuizAttempt> getQuizAttempts(Long quizId) {
        return quizAttemptRepository.findByQuizId(quizId);
    }


    // সব attempt (অ্যাডমিনের জন্য)
    public List<QuizAttempt> getAllAttempts() {
        return quizAttemptRepository.findAll();
    }


    // রেসপন্স বানানোর হেল্পার
    private QuizResultResponse buildResponse(QuizAttempt attempt) {
        QuizResultResponse res = new QuizResultResponse();
        res.setAttemptId(attempt.getId());
        res.setQuizId(attempt.getQuiz().getId());
        res.setQuizTitle(attempt.getQuiz().getTitle());
        res.setTotalQuestions(attempt.getTotalQuestions());
        res.setCorrect(attempt.getCorrect());
        res.setWrong(attempt.getWrong());
        res.setSkipped(attempt.getSkipped());
        res.setPercentage(attempt.getPercentage());
        res.setStatus(attempt.getStatus());
        res.setTimeTaken(attempt.getTimeTaken());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        res.setAttemptedAt(attempt.getAttemptedAt().format(fmt));

        return res;
    }


    // Map → JSON স্ট্রিং (সহজ ফরম্যাটে)
    private String mapToJson(Map<Long, String> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<Long, String> e : map.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(e.getKey()).append("\":\"").append(e.getValue()).append("\"");
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }
}