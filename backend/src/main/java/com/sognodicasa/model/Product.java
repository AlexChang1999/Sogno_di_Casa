package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 商品資料表
 * 對應資料庫的 products 資料表
 */
@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 商品名稱（必填）
    @Column(nullable = false, length = 200)
    private String name;

    // 品牌
    @Column(length = 100)
    private String brand;

    // 設計師
    @Column(length = 100)
    private String designer;

    // 商品類別：chair / sofa / table / storage
    @Column(length = 50)
    private String category;

    // 售價（台幣，必填）
    @Column(nullable = false)
    private Integer price;

    // 商品描述
    @Column(columnDefinition = "TEXT")
    private String description;

    // 主圖 URL（顯示在列表頁、首頁）
    @Column(name = "main_image", length = 500)
    private String mainImage;

    // 商品圖片 JSON 陣列（最多4張），格式：
    // [{"url":"http://..."},{"url":"http://..."},...]
    @Column(name = "gallery_json", columnDefinition = "TEXT")
    private String galleryJson;

    // 顏色選項 JSON 陣列，格式：
    // [{"name":"黑色皮革","hex":"#1a1a1a"},...]
    @Column(name = "colors_json", columnDefinition = "TEXT")
    private String colorsJson;

    // 商品規格 JSON（key-value pairs），格式：
    // [{"key":"尺寸","value":"84 × 84 × 84 cm"},{"key":"重量","value":"約 31 kg"}]
    @Column(name = "specs_json", columnDefinition = "TEXT")
    private String specsJson;

    // 品牌故事（可在商品詳情頁的「品牌故事」分頁顯示）
    @Column(name = "brand_story", columnDefinition = "TEXT")
    private String brandStory;

    // 木材選項 JSON 陣列（非必填），格式：
    // [{"wood":"胡桃木"},{"wood":"橡木"},...]
    @Column(name = "wood_options_json", columnDefinition = "TEXT")
    private String woodOptionsJson;

    // 商品尺寸（公分，非必填）
    @Column(name = "width_cm")
    private Integer widthCm;

    @Column(name = "depth_cm")
    private Integer depthCm;

    @Column(name = "height_cm")
    private Integer heightCm;

    // 是否為「本季主打商品」（首頁展示）
    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    // 是否為「設計經典」（首頁展示）
    @Column(name = "is_classic")
    private Boolean isClassic = false;

    // 是否為「首頁 Hero 大輪播」背景圖（首頁最上方）
    @Column(name = "is_hero")
    private Boolean isHero = false;

    // 是否有庫存
    @Column(name = "in_stock")
    private Boolean inStock = true;

    // 建立時間（自動設定）
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
