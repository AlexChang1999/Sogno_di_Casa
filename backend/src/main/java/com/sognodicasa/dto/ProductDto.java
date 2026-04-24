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
    private String designer;
    private String category;
    private Integer price;
    private String description;
    private String mainImage;
    private String galleryJson;       // 商品圖片 JSON 字串（最多4張）
    private String colorsJson;        // 顏色選項 JSON 字串
    private String specsJson;        // 商品規格 JSON 字串
    private String brandStory;       // 品牌故事
    private String woodOptionsJson;   // 木材選項 JSON 字串
    private Integer widthCm;          // 寬（公分）
    private Integer depthCm;          // 深（公分）
    private Integer heightCm;         // 高（公分）
    private Boolean isFeatured;       // 是否為本季主打
    private Boolean isClassic;        // 是否為設計經典
    private Boolean isHero;           // 是否為首頁 Hero 大輪播
    private Boolean inStock;
    private LocalDateTime createdAt;
}
