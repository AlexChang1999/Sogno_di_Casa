package com.sognodicasa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class ReviewRequest {
    private Long productId;
    private String authorName;
    private Integer rating;   // 1 ~ 5
    private String comment;
}
