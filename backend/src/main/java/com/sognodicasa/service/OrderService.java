package com.sognodicasa.service;

import com.sognodicasa.dto.OrderRequest;
import com.sognodicasa.model.Order;
import com.sognodicasa.model.OrderItem;
import com.sognodicasa.model.User;
import com.sognodicasa.repository.OrderRepository;
import com.sognodicasa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    /**
     * 建立新訂單（含收件資訊）
     */
    @Transactional
    public Order createOrder(String email, OrderRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("找不到使用者"));

        // 建立訂單主檔
        Order order = new Order(user, req.getTotal());

        // 帶入收件資訊
        order.setRecipientName(req.getRecipientName());
        order.setRecipientPhone(req.getRecipientPhone());
        order.setRecipientAddress(req.getRecipientAddress());
        order.setNote(req.getNote());
        order.setStatus("PENDING"); // 預設狀態：待處理

        // 把每個商品明細加入訂單
        req.getItems().forEach(itemDto -> {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(itemDto.getProductId());
            item.setProductName(itemDto.getProductName());
            item.setBrand(itemDto.getBrand());
            item.setPrice(itemDto.getPrice());
            item.setQty(itemDto.getQty());
            item.setColor(itemDto.getColor());
            item.setWood(itemDto.getWood());
            order.getItems().add(item);
        });

        return orderRepository.save(order);
    }

    /**
     * 取得某會員的所有訂單
     */
    public List<Order> getOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("找不到使用者"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /**
     * 取得所有訂單（管理員用）
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 更新訂單配送狀態（管理員用）
     * status 可為：PENDING / CONFIRMED / SHIPPING / DELIVERED
     */
    @Transactional
    public Order updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("找不到訂單 id=" + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
