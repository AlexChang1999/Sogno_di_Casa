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
    private String designer;
    private String category;        // chair / sofa / table / storage
    private Integer price;
    private String description;
    private String mainImage;
    private String galleryJson;     // 商品圖片 JSON 字串（最多4張）
    private String colorsJson;      // 顏色選項 JSON 字串（非必填）
    private String specsJson;      // 商品規格 JSON 字串（非必填）
    private String brandStory;     // 品牌故事（非必填）
    private String woodOptionsJson; // 木材選項 JSON 字串（非必填）
    private Integer widthCm;        // 寬（公分，非必填）
    private Integer depthCm;        // 深（公分，非必填）
    private Integer heightCm;       // 高（公分，非必填）
    private Boolean isFeatured;     // 是否為本季主打
    private Boolean isClassic;      // 是否為設計經典
    private Boolean isHero;         // 是否為首頁 Hero 大輪播
    private Boolean inStock;
}
