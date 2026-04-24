package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;

/** 品牌新增/更新的請求資料 */
@Getter @Setter
public class BrandRequest {
    private String name;
    private String country;
    private Integer foundedYear;
    private String tagline;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String websiteUrl;
    private Integer sortOrder;
}
