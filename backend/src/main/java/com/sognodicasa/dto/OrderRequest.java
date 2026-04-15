package com.sognodicasa.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

/** 前端結帳時傳過來的完整訂單資料 */
@Getter @Setter
public class OrderRequest {

    @NotEmpty(message = "訂單商品不可為空")
    private List<OrderItemDto> items;

    private BigDecimal total; // 前端計算的總金額

    // 收件資訊（結帳時必填）
    @NotBlank(message = "收件人姓名不可為空")
    private String recipientName;

    @NotBlank(message = "聯絡電話不可為空")
    private String recipientPhone;

    @NotBlank(message = "收件地址不可為空")
    private String recipientAddress;

    private String note; // 備註（非必填）
}
