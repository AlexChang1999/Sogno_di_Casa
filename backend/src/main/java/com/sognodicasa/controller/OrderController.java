package com.sognodicasa.controller;

import com.sognodicasa.dto.OrderRequest;
import com.sognodicasa.model.Order;
import com.sognodicasa.model.OrderItem;
import com.sognodicasa.service.OrderService;
import com.sognodicasa.model.OrderHistory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 訂單 API
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** POST /api/orders — 建立新訂單（含收件資訊） */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest req) {
        Order order = orderService.createOrder(userDetails.getUsername(), req);
        return ResponseEntity.ok(Map.of(
                "orderId", order.getId(),
                "message", "訂單建立成功"));
    }

    /** GET /api/orders — 取得目前登入會員的訂單 */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Order> orders = orderService.getOrders(userDetails.getUsername());
        return ResponseEntity.ok(toResponseList(orders));
    }

    /** GET /api/orders/admin/all — 取得所有會員訂單（管理員用） */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(toResponseList(orders));
    }

    /** DELETE /api/orders/{id} — 刪除訂單（管理員用） */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(Map.of("message", "訂單已成功移除"));
    }

    /** PATCH /api/orders/{id}/status — 更新訂單狀態與配送時間，並紀錄歷史 */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) { // 注入當前登入者

        Order order = orderService.findById(id);
        String oldStatus = order.getStatus();
        StringBuilder actionLog = new StringBuilder();

        // 1. 處理狀態更新
        if (body.containsKey("status")) {
            String newStatus = body.get("status");
            if (!newStatus.equals(oldStatus)) {
                order.setStatus(newStatus);
                actionLog.append("狀態更新為「").append(newStatus).append("」 ");
            }
        }

        // 2. 處理配送時間更新
        if (body.containsKey("deliveryTime")) {
            String dt = body.get("deliveryTime");
            if (dt != null && !dt.isEmpty()) {
                order.setDeliveryTime(LocalDateTime.parse(dt));
                actionLog.append("配送排程：").append(dt.replace("T", " "));
            } else {
                order.setDeliveryTime(null);
                actionLog.append("清空配送時間");
            }
        }

        orderService.save(order);

        // 3. 如果有任何變動，就寫入 OrderHistory
        if (actionLog.length() > 0) {
            orderService.addHistory(order, userDetails.getUsername(), actionLog.toString().trim());
        }

        return ResponseEntity.ok(Map.of("message", "訂單已更新"));
    }

    /** GET /api/orders/{id}/history — 取得訂單編輯紀錄 */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getOrderHistory(@PathVariable Long id) {
        List<OrderHistory> historyList = orderService.getOrderHistory(id);

        // 轉為前端方便渲染的 JSON 格式
        List<Map<String, Object>> result = historyList.stream().map(h -> Map.<String, Object>of(
                "operator", h.getOperator(),
                "action", h.getAction(),
                "time", h.getCreatedAt().toString())).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /** 把 Order 實體轉成前端需要的格式 */
    private List<Map<String, Object>> toResponseList(List<Order> orders) {
        return orders.stream().map(o -> {
            // 1. 處理商品明細 (這裡不要放 deliveryTime)
            List<Map<String, Object>> items = o.getItems().stream().map(item -> Map.<String, Object>of(
                    "productName", item.getProductName(),
                    "brand", item.getBrand() != null ? item.getBrand() : "",
                    "price", item.getPrice(),
                    "qty", item.getQty(),
                    "color", item.getColor() != null ? item.getColor() : "",
                    "wood", item.getWood() != null ? item.getWood() : "")).collect(Collectors.toList());

            // 2. 處理訂單主體 (改用 HashMap，突破 Map.of 只能放 10 組的限制)
            Map<String, Object> orderMap = new java.util.HashMap<>();
            orderMap.put("id", "ORD-" + o.getId());
            orderMap.put("rawId", o.getId());
            orderMap.put("date", o.getCreatedAt().toLocalDate().toString());
            orderMap.put("total", o.getTotal());
            orderMap.put("status", o.getStatus() != null ? o.getStatus() : "待處理");
            orderMap.put("recipientName", o.getRecipientName() != null ? o.getRecipientName() : "");
            orderMap.put("recipientPhone", o.getRecipientPhone() != null ? o.getRecipientPhone() : "");
            orderMap.put("recipientAddress", o.getRecipientAddress() != null ? o.getRecipientAddress() : "");
            orderMap.put("note", o.getNote() != null ? o.getNote() : "");
            orderMap.put("isTest", o.getIsTest() != null ? o.getIsTest() : false);
            orderMap.put("deliveryTime", o.getDeliveryTime() != null ? o.getDeliveryTime().toString() : "");
            orderMap.put("items", items);

            return orderMap;
        }).collect(Collectors.toList());
    }
}
