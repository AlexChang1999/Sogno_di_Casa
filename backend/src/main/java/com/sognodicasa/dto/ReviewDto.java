package com.sognodicasa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
public class ReviewDto {
    private Long id;
    private Long productId;
    private String authorName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
