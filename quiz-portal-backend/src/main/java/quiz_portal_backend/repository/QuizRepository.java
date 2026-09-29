package quiz_portal_backend.repository;

import quiz_portal_backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByCategoryId(Long categoryId);

    List<Quiz> findByStatus(String status);

    List<Quiz> findByCategoryIdAndStatus(Long categoryId, String status);

    // 🔥 নতুন: কোড দিয়ে খোঁজা
    Optional<Quiz> findByQuizCode(String quizCode);
}