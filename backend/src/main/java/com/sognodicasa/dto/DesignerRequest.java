package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;

/** 設計師新增/更新的請求資料 */
@Getter @Setter
public class DesignerRequest {
    private String name;
    private String nationality;
    private Integer birthYear;
    private Integer deathYear;
    private String tagline;
    private String biography;
    private String portraitUrl;
    private String associatedBrands;
    private String famousWorks;
    private Integer sortOrder;
}
