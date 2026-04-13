package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/** 前端傳過來的單一購買商品資料 */
@Getter @Setter
public class OrderItemDto {
    private Integer productId;
    private String productName;
    private String brand;
    private BigDecimal price;
    private Integer qty;
    private String color; // 顏色選項（如「棕色皮革」）
    private String wood;  // 木材選項（如「白梣木」）
}
