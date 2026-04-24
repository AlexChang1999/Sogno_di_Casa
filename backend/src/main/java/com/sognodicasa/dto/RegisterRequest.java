package com.sognodicasa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 完成註冊時，前端傳來的資料
 * 只需要 email + 驗證碼（其他資訊已在 send-code 時暫存）
 */
@Getter @Setter
public class RegisterRequest {

    @NotBlank(message = "Email 不可為空")
    @Email(message = "Email 格式不正確")
    private String email;

    @NotBlank(message = "驗證碼不可為空")
    private String code;
}
