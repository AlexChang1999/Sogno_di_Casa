package com.sognodicasa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 對應資料庫的 users 資料表
 * @Entity 告訴 JPA 這個 class 要對應一張資料表
 */
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {

    // 主鍵，自動遞增（1, 2, 3...）
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 姓名，不可為空
    @Column(nullable = false, length = 100)
    private String name;

    // Email，不可重複，不可為空
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    // 密碼（存 BCrypt 加密後的雜湊值，非明文）
    @Column(nullable = false)
    private String password;

    // 註冊時間
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // 角色：USER（一般會員）或 ADMIN（商家管理員）
    @Column(length = 20)
    private String role = "USER";

    // 一個會員有多筆訂單（一對多關聯）
    // mappedBy = "user" 表示由 Order.user 這端管理關聯
    // cascade = ALL 表示刪除會員時，訂單也一起刪除
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
