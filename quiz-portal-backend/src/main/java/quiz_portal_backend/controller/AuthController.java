package quiz_portal_backend.controller;

import quiz_portal_backend.dto.LoginRequest;
import quiz_portal_backend.dto.RegisterRequest;
import quiz_portal_backend.entity.User;
import quiz_portal_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;


    // নতুন ইউজার রেজিস্ট্রেশন
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {

        Map<String, Object> response = new HashMap<>();

        // ইমেইল আগে থেকেই আছে কিনা চেক
        if (userService.existsByEmail(request.getEmail())) {
            response.put("success", false);
            response.put("message", "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত!");
            return ResponseEntity.badRequest().body(response);
        }

        // নতুন ইউজার তৈরি
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());  // এখন সাধারণ টেক্সট, পরে hash করব
        user.setRole("USER");

        User saved = userService.createUser(user);

        // পাসওয়ার্ড রেসপন্স থেকে সরিয়ে দিই
        saved.setPassword(null);

        response.put("success", true);
        response.put("message", "নিবন্ধন সফল! এখন লগইন করুন।");
        response.put("data", saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    // লগইন
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {

        Map<String, Object> response = new HashMap<>();

        // ইমেইল দিয়ে ইউজার খোঁজা
        User user = userService.getUserByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            response.put("success", false);
            response.put("message", "ইমেইল বা পাসওয়ার্ড ভুল!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // পাসওয়ার্ড চেক
        if (!user.getPassword().equals(request.getPassword())) {
            response.put("success", false);
            response.put("message", "ইমেইল বা পাসওয়ার্ড ভুল!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // পাসওয়ার্ড রেসপন্স থেকে সরিয়ে দিই
        user.setPassword(null);

        response.put("success", true);
        response.put("message", "লগইন সফল!");
        response.put("data", user);

        return ResponseEntity.ok(response);
    }
}