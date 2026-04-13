package com.sognodicasa.controller;

import com.sognodicasa.dto.LoginRequest;
import com.sognodicasa.dto.LoginResponse;
import com.sognodicasa.dto.RegisterRequest;
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
 * @RestController = @Controller + @ResponseBody，自動把回傳值轉成 JSON
 * @RequestMapping 設定這個 Controller 的路徑前綴
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 從 application.properties 讀取管理員設定密碼
    @Value("${app.admin-setup-secret:FORMA_ADMIN_2025}")
    private String adminSetupSecret;

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
     * POST /api/auth/setup-admin
     * 把指定 Email 的帳號升級為管理員
     * 需要正確的 secret（在 application.properties 設定）
     *
     * 請求 Body：{ "email": "admin@forma.com", "secret": "FORMA_ADMIN_2025" }
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

    /**
     * 全域例外處理：當 Service 拋出 IllegalArgumentException 時，回傳 400
     * 例如：Email 已被使用、密碼錯誤
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}
