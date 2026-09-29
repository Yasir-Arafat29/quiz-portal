package quiz_portal_backend.repository;

import quiz_portal_backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    // একজন ইউজারের সব attempt
    List<QuizAttempt> findByUserId(Long userId);

    // একটি কুইজের সব attempt
    List<QuizAttempt> findByQuizId(Long quizId);

    // একজন ইউজারের সব attempt – নতুন থেকে পুরনো
    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);
}