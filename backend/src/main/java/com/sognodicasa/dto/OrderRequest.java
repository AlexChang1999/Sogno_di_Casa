package com.sognodicasa.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

/** 前端結帳時傳過來的完整訂單資料 */
@Getter @Setter
public class OrderRequest {

    @NotEmpty(message = "訂單商品不可為空")
    private List<OrderItemDto> items;

    private BigDecimal total; // 前端計算的總金額（含稅含運費）
}
