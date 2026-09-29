package quiz_portal_backend.controller;

import quiz_portal_backend.entity.Category;
import quiz_portal_backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;


    // সব ক্যাটাগরি দেখা (GET)
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }


    // একটি ক্যাটাগরি আইডি দিয়ে দেখা (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    // নতুন ক্যাটাগরি তৈরি (POST)
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category saved = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


    // ক্যাটাগরি আপডেট (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {
        try {
            Category updated = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // ক্যাটাগরি মুছে ফেলা (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}