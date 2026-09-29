package quiz_portal_backend.service;

import quiz_portal_backend.entity.User;
import quiz_portal_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // সব ইউজার দেখা
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // আইডি দিয়ে ইউজার খোঁজা
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // ইমেইল দিয়ে ইউজার খোঁজা (লগইনের জন্য)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // নতুন ইউজার তৈরি
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // ইমেইল আগে থেকেই আছে কিনা চেক
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
        // ইউজার মুছে ফেলা
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}