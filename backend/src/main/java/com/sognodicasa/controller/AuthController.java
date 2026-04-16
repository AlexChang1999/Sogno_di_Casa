package com.sognodicasa.controller;

import com.sognodicasa.dto.LoginRequest;
import com.sognodicasa.dto.LoginResponse;
import com.sognodicasa.dto.RegisterRequest;
import com.sognodicasa.dto.SendCodeRequest;
import com.sognodicasa.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 會員驗證 API
 *
 * 註冊流程：
 *   1. POST /api/auth/send-code  → 發送驗證碼到 Email
 *   2. POST /api/auth/register   → 輸入驗證碼完成註冊
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.admin-setup-secret:FORMA_ADMIN_2025}")
    private String adminSetupSecret;

    /**
     * POST /api/auth/send-code
     * 請求 Body：{ "name": "王小明", "email": "...", "password": "..." }
     * 行為：發送 6 位數驗證碼到指定 Email，有效期 10 分鐘
     */
    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@Valid @RequestBody SendCodeRequest req) {
        authService.sendVerificationCode(req);
        return ResponseEntity.ok(Map.of("message", "驗證碼已發送至 " + req.getEmail() + "，請在 10 分鐘內完成驗證"));
    }

    /**
     * POST /api/auth/register
     * 請求 Body：{ "email": "...", "code": "123456" }
     * 行為：驗證碼正確 → 正式建立帳號並回傳 JWT
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest req) {
        LoginResponse response = authService.register(req);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * 請求 Body：{ "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/setup-admin
     * 請求 Body：{ "email": "...", "secret": "FORMA_ADMIN_2025" }
     */
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(@RequestBody Map<String, String> body) {
        String email  = body.get("email");
        String secret = body.get("secret");
        if (email == null || secret == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "請提供 email 和 secret"));
        }
        authService.makeAdmin(email, secret, adminSetupSecret);
        return ResponseEntity.ok(Map.of("message", "已成功升級為管理員，請重新登入"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}
