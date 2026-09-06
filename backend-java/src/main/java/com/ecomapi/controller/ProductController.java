package com.ecomapi.controller;

import com.ecomapi.model.Product;
import com.ecomapi.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * GET /api/products/categories/hierarchy
     * Must be declared before /{id} so Spring matches literal paths first.
     */
    @GetMapping("/categories/hierarchy")
    public ResponseEntity<?> getCategoriesHierarchy() {
        try {
            List<?> hierarchy = productRepository.getCategoriesHierarchyAsync();
            return ResponseEntity.ok(Map.of("success", true, "data", hierarchy));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", "Internal server error", "message", e.getMessage()));
        }
    }

    /**
     * GET /api/products/categories
     * Returns distinct primary categories.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<String> categories = mongoTemplate.findDistinct(
                    new Query(Criteria.where("active").is(true)),
                    "primaryCategory", "products", String.class);
            return ResponseEntity.ok(Map.of("success", true, "data", categories));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", "Internal server error", "message", e.getMessage()));
        }
    }

    /**
     * GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        try {
            Product product = productRepository.findById(id).orElse(null);
            if (product == null) {
                return ResponseEntity.status(404)
                        .body(Map.of("success", false, "error", "Product not found"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", product));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", "Internal server error", "message", e.getMessage()));
        }
    }

    /**
     * GET /api/products
     * Supports filtering by category, primaryCategory, subCategory, department, subcategory, search.
     * Supports sorting: sort=price_asc|price_desc|rating_desc or sortBy+order params.
     */
    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String primaryCategory,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String order) {

        // Clamp bounds
        if (page  < 1)   page  = 1;
        if (limit < 1)   limit = 1;
        if (limit > 100) limit = 100;

        // Support both combined "sort=price_asc" and separate "sortBy=rating&order=desc"
        if (sort == null && sortBy != null) {
            sort = sortBy.toLowerCase() + "|" + (order != null ? order.toLowerCase() : "asc");
        }

        try {
            Criteria criteria = Criteria.where("active").is(true);

            if (category      != null) criteria = criteria.and("category").is(category);
            if (primaryCategory != null) criteria = criteria.and("primaryCategory").is(primaryCategory);
            if (subCategory   != null) criteria = criteria.and("subCategory").is(subCategory);
            if (department    != null) criteria = criteria.and("department").is(department);
            if (subcategory   != null) criteria = criteria.and("subcategory").is(subcategory);
            if (search        != null && !search.isEmpty()) {
                criteria = criteria.orOperator(
                        Criteria.where("title").regex(search, "i"),
                        Criteria.where("description").regex(search, "i"),
                        Criteria.where("brand").regex(search, "i")
                );
            }

            Sort mongoSort = resolveSort(sort);
            Query query = new Query(criteria).with(mongoSort);

            long totalItems = mongoTemplate.count(query, Product.class);
            int totalPages  = (int) Math.ceil((double) totalItems / limit);
            boolean hasNext = page < totalPages;
            boolean hasPrev = page > 1;

            query.skip((long)(page - 1) * limit).limit(limit);
            List<Product> products = mongoTemplate.find(query, Product.class);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products,
                "pagination", Map.of(
                    "page", page,
                    "limit", limit,
                    "totalItems", totalItems,
                    "totalPages", totalPages,
                    "hasNext", hasNext,
                    "hasPrevious", hasPrev
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "error", "Internal server error", "message", e.getMessage()));
        }
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort) {
            case "price_asc",  "price|asc"    -> Sort.by(Sort.Direction.ASC,  "priceMinor");
            case "price_desc", "price|desc"   -> Sort.by(Sort.Direction.DESC, "priceMinor");
            case "rating_desc","rating|desc"  -> Sort.by(Sort.Direction.DESC, "rating");
            case "rating_asc", "rating|asc"   -> Sort.by(Sort.Direction.ASC,  "rating");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
