package com.sognodicasa.controller;

import com.sognodicasa.dto.LoginRequest;
import com.sognodicasa.dto.LoginResponse;
import com.sognodicasa.dto.RegisterRequest;
import com.sognodicasa.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 會員驗證 API
 *
 * @RestController = @Controller + @ResponseBody，自動把回傳值轉成 JSON
 * @RequestMapping 設定這個 Controller 的路徑前綴
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * 請求 Body（JSON）：{ "name": "王小明", "email": "...", "password": "..." }
     * 回應：{ "token": "...", "name": "王小明", "email": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest req) {
        LoginResponse response = authService.register(req);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * 請求 Body（JSON）：{ "email": "...", "password": "..." }
     * 回應：{ "token": "...", "name": "...", "email": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    /**
     * 全域例外處理：當 Service 拋出 IllegalArgumentException 時，回傳 400
     * 例如：Email 已被使用、密碼錯誤
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}
