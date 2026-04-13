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

    // 顏色款式 JSON 陣列，格式：
    // [{"color":"黑色","thumb":"http://...","full":"http://..."},...]
    @Column(name = "gallery_json", columnDefinition = "TEXT")
    private String galleryJson;

    // 是否有庫存
    @Column(name = "in_stock")
    private Boolean inStock = true;

    // 建立時間（自動設定）
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
