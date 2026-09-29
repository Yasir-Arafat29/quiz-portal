package quiz_portal_backend.service;

import quiz_portal_backend.entity.Question;
import quiz_portal_backend.entity.Quiz;
import quiz_portal_backend.repository.QuestionRepository;
import quiz_portal_backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    // নির্দিষ্ট কুইজের সব প্রশ্ন
    public List<Question> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizId(quizId);
    }

        // সব প্রশ্ন
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // আইডি দিয়ে একটি প্রশ্ন
    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    // নতুন প্রশ্ন তৈরি
    public Question createQuestion(Question question, Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("কুইজ খুঁজে পাওয়া যায়নি"));
        question.setQuiz(quiz);
        return questionRepository.save(question);
    }

    // প্রশ্ন আপডেট
    public Question updateQuestion(Long id, Question questionDetails) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("প্রশ্ন খুঁজে পাওয়া যায়নি"));

        question.setQuestionText(questionDetails.getQuestionText());
        question.setOptionA(questionDetails.getOptionA());
        question.setOptionB(questionDetails.getOptionB());
        question.setOptionC(questionDetails.getOptionC());
        question.setOptionD(questionDetails.getOptionD());
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());

        return questionRepository.save(question);
    }

    // প্রশ্ন মুছে ফেলা
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
        // একসাথে অনেক প্রশ্ন তৈরি
    public List<Question> createBulkQuestions(Long quizId, List<Question> questions) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("কুইজ খুঁজে পাওয়া যায়নি"));

        for (Question q : questions) {
            q.setQuiz(quiz);
        }

        return questionRepository.saveAll(questions);
    }

    // নির্দিষ্ট কুইজের সব প্রশ্ন মুছে ফেলা
    public void deleteQuestionsByQuiz(Long quizId) {
        questionRepository.deleteByQuizId(quizId);
    }
}