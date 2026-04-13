package com.sognodicasa.repository;

import com.sognodicasa.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // 查詢某會員的所有訂單，依建立時間由新到舊排序
    // 自動產生：SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
