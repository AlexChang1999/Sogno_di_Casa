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
     * 建立新訂單
     * @param email 目前登入的會員 Email（從 JWT 解析）
     * @param req   前端傳來的訂單資料
     * @return 儲存後的訂單
     *
     * @Transactional：確保訂單主檔和所有商品明細一起存入，
     * 若中途出錯則全部 rollback（不會存到一半）
     */
    @Transactional
    public Order createOrder(String email, OrderRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("找不到使用者"));

        // 建立訂單主檔
        Order order = new Order(user, req.getTotal());

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

        // cascade = ALL 會自動把 order_items 也一起存入
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
}
