package com.sognodicasa.service;

import com.sognodicasa.dto.ReviewDto;
import com.sognodicasa.dto.ReviewRequest;
import com.sognodicasa.model.Product;
import com.sognodicasa.model.Review;
import com.sognodicasa.repository.ProductRepository;
import com.sognodicasa.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public List<ReviewDto> findByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ReviewDto create(ReviewRequest req) {
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("評分必須介於 1 到 5");
        }
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new NoSuchElementException("找不到商品 id=" + req.getProductId()));

        Review review = new Review();
        review.setProduct(product);
        review.setAuthorName(req.getAuthorName() != null ? req.getAuthorName() : "匿名");
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        return toDto(reviewRepository.save(review));
    }

    public long countByProduct(Long productId) {
        return reviewRepository.countByProductId(productId);
    }

    private ReviewDto toDto(Review r) {
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        dto.setProductId(r.getProduct().getId());
        dto.setAuthorName(r.getAuthorName());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
