package com.sognodicasa.controller;

import com.sognodicasa.dto.OrderRequest;
import com.sognodicasa.model.Order;
import com.sognodicasa.model.OrderItem;
import com.sognodicasa.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 訂單 API（需要 JWT token 才能呼叫）
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders
     * 建立新訂單（結帳用）
     *
     * @AuthenticationPrincipal 自動注入目前登入的使用者
     * Spring Security 會從 JWT token 中解析出使用者資訊
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest req) {
        Order order = orderService.createOrder(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of(
            "orderId", order.getId(),
            "message", "訂單建立成功"
        ));
    }

    /**
     * GET /api/orders
     * 取得目前登入會員的所有歷史訂單
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Order> orders = orderService.getOrders(userDetails.getUsername());

        // 把 Order Entity 轉換成簡潔的 JSON 格式回傳給前端
        List<Map<String, Object>> result = orders.stream().map(o -> {
            List<Map<String, Object>> items = o.getItems().stream().map(item ->
                Map.<String, Object>of(
                    "productName", item.getProductName(),
                    "brand",       item.getBrand() != null ? item.getBrand() : "",
                    "price",       item.getPrice(),
                    "qty",         item.getQty(),
                    "color",       item.getColor() != null ? item.getColor() : "",
                    "wood",        item.getWood()  != null ? item.getWood()  : ""
                )
            ).collect(Collectors.toList());

            return Map.<String, Object>of(
                "id",        "ORD-" + o.getId(),
                "date",      o.getCreatedAt().toLocalDate().toString(),
                "total",     o.getTotal(),
                "items",     items
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
