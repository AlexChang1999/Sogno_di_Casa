package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 新增 / 編輯商品的請求格式
 * 前端以 JSON 傳過來，後端用這個 class 接收
 */
@Getter @Setter
public class ProductRequest {
    private String name;
    private String brand;
    private String category;    // chair / sofa / table / storage
    private Integer price;
    private String description;
    private String mainImage;
    private String galleryJson; // JSON 字串
    private Boolean inStock;
}
