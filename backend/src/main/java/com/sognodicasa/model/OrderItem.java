package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

/**
 * 對應資料庫的 order_items 資料表（訂單明細）
 * 記錄每筆訂單購買了哪些家具、幾件、什麼顏色/材質
 */
@Entity
@Table(name = "order_items")
@Getter @Setter @NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 屬於哪張訂單
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 商品資訊（用 String 儲存名稱，避免商品被刪除時訂單紀錄消失）
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(length = 100)
    private String brand;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer qty;

    // 顏色與材質選項（選填）
    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String wood;
}
