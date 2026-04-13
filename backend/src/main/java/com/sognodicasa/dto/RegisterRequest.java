package com.sognodicasa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO（Data Transfer Object）：定義前端傳過來的註冊資料格式
 * 加上驗證標註，讓 Spring 自動檢查輸入是否合法
 */
@Getter @Setter
public class RegisterRequest {

    @NotBlank(message = "姓名不可為空")
    private String name;

    @NotBlank(message = "Email 不可為空")
    @Email(message = "Email 格式不正確")
    private String email;

    @NotBlank(message = "密碼不可為空")
    @Size(min = 6, message = "密碼至少 6 個字元")
    private String password;
}
