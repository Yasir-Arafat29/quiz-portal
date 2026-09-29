package quiz_portal_backend.service;

import quiz_portal_backend.entity.Category;
import quiz_portal_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // সব ক্যাটাগরি দেখা
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // একটি ক্যাটাগরি আইডি দিয়ে দেখা
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // নতুন ক্যাটাগরি তৈরি
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // ক্যাটাগরি আপডেট
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ক্যাটাগরি খুঁজে পাওয়া যায়নি"));

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());

        return categoryRepository.save(category);
    }

    // ক্যাটাগরি মুছে ফেলা
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}