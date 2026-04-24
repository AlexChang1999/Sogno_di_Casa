package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * 設計師資料表
 * 對應資料庫的 designers 資料表
 * 用於「設計師」頁面展示與後台管理
 */
@Entity
@Table(name = "designers")
@Getter @Setter @NoArgsConstructor
public class Designer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 設計師姓名（必填，例如：Hans J. Wegner）
    @Column(nullable = false, length = 100)
    private String name;

    // 國籍（例如：丹麥、義大利、瑞士）
    @Column(length = 50)
    private String nationality;

    // 出生年（例如：1914）
    @Column(name = "birth_year")
    private Integer birthYear;

    // 逝世年（選填，在世設計師可空白）
    @Column(name = "death_year")
    private Integer deathYear;

    // 設計師簡短標語（例如：「椅子的詩人」）
    @Column(length = 200)
    private String tagline;

    // 設計師傳記長文
    @Column(columnDefinition = "TEXT")
    private String biography;

    // 肖像照 URL（正方形）
    @Column(name = "portrait_url", length = 500)
    private String portraitUrl;

    // 合作品牌（逗號分隔字串，例如：「Carl Hansen & Søn, PP Møbler, Fritz Hansen」）
    @Column(name = "associated_brands", length = 500)
    private String associatedBrands;

    // 代表作品（逗號分隔字串，例如：「Wishbone Chair, Papa Bear Chair」）
    @Column(name = "famous_works", length = 500)
    private String famousWorks;

    // 顯示順序
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
