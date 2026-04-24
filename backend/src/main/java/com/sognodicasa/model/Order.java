package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 對應資料庫的 orders 資料表（訂單主檔）
 */
@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 多筆訂單屬於同一個會員（多對一關聯）
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 訂單總金額（含稅含運費）
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    // 配送狀態：PENDING / CONFIRMED / SHIPPING / DELIVERED
    @Column(length = 20)
    private String status = "PENDING";

    // 收件人姓名
    @Column(name = "recipient_name", length = 100)
    private String recipientName;

    // 收件人電話
    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    // 收件地址
    @Column(name = "recipient_address", length = 300)
    private String recipientAddress;

    // 備註
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // 一筆訂單有多個商品明細
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Order(User user, BigDecimal total) {
        this.user  = user;
        this.total = total;
    }
}
