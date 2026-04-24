package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 品牌資料表
 * 對應資料庫的 brands 資料表
 * 用於「關於品牌」頁面展示與後台管理
 */
@Entity
@Table(name = "brands")
@Getter @Setter @NoArgsConstructor
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 品牌名稱（必填，例如：B&B Italia、Cassina）
    @Column(nullable = false, length = 100)
    private String name;

    // 品牌所屬國家（例如：義大利、丹麥）
    @Column(length = 50)
    private String country;

    // 創立年份（例如：1927）
    @Column(name = "founded_year")
    private Integer foundedYear;

    // 品牌簡短標語（顯示在卡片上，一句話，例如：「義大利家具工藝的百年傳承」）
    @Column(length = 200)
    private String tagline;

    // 品牌故事長文（顯示在詳情頁，可多段落）
    @Column(columnDefinition = "TEXT")
    private String description;

    // 品牌 logo 圖片 URL（正方形，卡片縮圖用）
    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    // 品牌形象照 URL（詳情頁 hero banner 用，橫向大圖）
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    // 品牌官網 URL（選填）
    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    // 顯示順序（數字越小越前面，選填）
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
