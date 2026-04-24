package com.sognodicasa.controller;

import com.sognodicasa.dto.OrderRequest;
import com.sognodicasa.model.Order;
import com.sognodicasa.model.OrderItem;
import com.sognodicasa.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
            "message", "訂單建立成功"
        ));
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

    /** PATCH /api/orders/{id}/status — 更新訂單配送狀態（管理員用） */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || !List.of("PENDING","CONFIRMED","SHIPPING","DELIVERED").contains(status)) {
            return ResponseEntity.badRequest().body(Map.of("message", "無效的狀態值"));
        }
        Order updated = orderService.updateStatus(id, status);
        return ResponseEntity.ok(Map.of(
            "orderId", updated.getId(),
            "status", updated.getStatus(),
            "message", "訂單狀態已更新"
        ));
    }

    /** 把 Order 實體轉成前端需要的格式 */
    private List<Map<String, Object>> toResponseList(List<Order> orders) {
        return orders.stream().map(o -> {
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
                "id",               "ORD-" + o.getId(),
                "rawId",            o.getId(),
                "date",             o.getCreatedAt().toLocalDate().toString(),
                "total",            o.getTotal(),
                "status",           o.getStatus() != null ? o.getStatus() : "PENDING",
                "recipientName",    o.getRecipientName() != null ? o.getRecipientName() : "",
                "recipientPhone",   o.getRecipientPhone() != null ? o.getRecipientPhone() : "",
                "recipientAddress", o.getRecipientAddress() != null ? o.getRecipientAddress() : "",
                "note",             o.getNote() != null ? o.getNote() : "",
                "items",            items
            );
        }).collect(Collectors.toList());
    }
}
