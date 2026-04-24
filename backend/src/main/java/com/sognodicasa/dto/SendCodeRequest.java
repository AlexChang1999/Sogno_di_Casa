package com.sognodicasa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 請求發送驗證碼時，前端傳來的資料
 * 包含完整的註冊資訊（名稱、Email、密碼）
 * 後端會暫存這些資料，等驗證碼通過後再正式建立帳號
 */
@Getter @Setter
public class SendCodeRequest {

    @NotBlank(message = "姓名不可為空")
    private String name;

    @NotBlank(message = "Email 不可為空")
    @Email(message = "Email 格式不正確")
    private String email;

    @NotBlank(message = "密碼不可為空")
    @Size(min = 6, message = "密碼至少 6 個字元")
    private String password;
}
