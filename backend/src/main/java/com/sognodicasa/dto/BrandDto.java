package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/** 品牌 API 回傳資料 */
@Getter @Setter
public class BrandDto {
    private Long id;
    private String name;
    private String country;
    private Integer foundedYear;
    private String tagline;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String websiteUrl;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
