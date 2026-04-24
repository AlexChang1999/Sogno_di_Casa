package com.sognodicasa.controller;

import com.sognodicasa.dto.ReviewDto;
import com.sognodicasa.dto.ReviewRequest;
import com.sognodicasa.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * 商品評價 API
 *
 * 公開端點：GET /api/reviews?productId=X
 * 需登入：  POST /api/reviews
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** GET /api/reviews?productId=X — 取得該商品所有評價 */
    @GetMapping
    public ResponseEntity<List<ReviewDto>> getByProduct(@RequestParam Long productId) {
        return ResponseEntity.ok(reviewService.findByProduct(productId));
    }

    /** POST /api/reviews — 新增評價（需登入） */
    @PostMapping
    public ResponseEntity<ReviewDto> create(@RequestBody ReviewRequest req) {
        return ResponseEntity.status(201).body(reviewService.create(req));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
    }
}
