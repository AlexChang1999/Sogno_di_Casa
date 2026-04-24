package com.sognodicasa.repository;

import com.sognodicasa.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    // 透過訂單 ID 找歷史紀錄，並按時間由新到舊排序
    List<OrderHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}