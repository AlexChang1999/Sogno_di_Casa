package com.sognodicasa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 商品 API 回應格式
 * 把 Product 實體轉成這個格式後回傳給前端
 */
@Getter @Setter @NoArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String brand;
    private String category;
    private Integer price;
    private String description;
    private String mainImage;
    private String galleryJson;  // JSON 字串，前端解析成陣列
    private Boolean inStock;
    private LocalDateTime createdAt;
}
