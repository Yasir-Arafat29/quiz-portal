package quiz_portal_backend.entity;

import java.security.SecureRandom;

public class QuizCodeGenerator {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();


    // কোড বানাও: প্রথম ৪ অক্ষর (টাইটেল থেকে) + "-" + ৪টি র‍্যান্ডম অক্ষর
    public static String generate(String title) {

        String prefix = extractPrefix(title);

        StringBuilder suffix = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            suffix.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }

        return prefix + "-" + suffix;
    }


    // টাইটেল থেকে ৪ অক্ষরের prefix বানাও (বাংলা থাকলে "QUIZ")
    private static String extractPrefix(String title) {
        if (title == null || title.isEmpty()) {
            return "QUIZ";
        }

        // শুধু ইংরেজি letters নাও
        String letters = title.replaceAll("[^A-Za-z]", "").toUpperCase();

        if (letters.length() >= 4) {
            return letters.substring(0, 4);
        } else if (letters.length() > 0) {
            // কম হলে "QUIZ" এর সাথে মিশাও
            String filler = "QUIZ";
            return (letters + filler).substring(0, 4);
        } else {
            return "QUIZ";
        }
    }
}