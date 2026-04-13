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
    // @JoinColumn 指定外鍵欄位名稱
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 訂單總金額（含稅含運費）
    // BigDecimal 適合存金額，精度不會有浮點數誤差
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

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
