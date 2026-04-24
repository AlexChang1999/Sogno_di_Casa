package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
@Getter @Setter @NoArgsConstructor
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 關聯到訂單主檔
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 操作人員的 Email 或帳號
    @Column(nullable = false)
    private String operator;

    // 記錄具體的變更內容 (例如："狀態改為：配送中")
    @Column(nullable = false)
    private String action;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public OrderHistory(Order order, String operator, String action) {
        this.order = order;
        this.operator = operator;
        this.action = action;
    }
}