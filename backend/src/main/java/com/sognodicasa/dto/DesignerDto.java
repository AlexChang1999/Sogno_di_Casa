package com.sognodicasa.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/** 設計師 API 回傳資料 */
@Getter @Setter
public class DesignerDto {
    private Long id;
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
    private LocalDateTime createdAt;
}
