package quiz_portal_backend.repository;

import quiz_portal_backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // নির্দিষ্ট কুইজের সব প্রশ্ন
    List<Question> findByQuizId(Long quizId);

    // নির্দিষ্ট কুইজের প্রশ্ন সংখ্যা
    long countByQuizId(Long quizId);

    // নির্দিষ্ট কুইজের প্রশ্ন মুছে ফেলা
    void deleteByQuizId(Long quizId);
}