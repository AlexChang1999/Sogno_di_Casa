package com.sognodicasa.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 登入成功後回傳給前端的資料
 * 前端收到後把 token 存到 localStorage
 */
@Getter @AllArgsConstructor
public class LoginResponse {
    private String token;  // JWT token（前端帶著它呼叫 API）
    private String name;   // 會員姓名（顯示在導覽列）
    private String email;  // 會員 Email
    private String role;   // "USER" 或 "ADMIN"（前端判斷是否顯示後台入口）
}
