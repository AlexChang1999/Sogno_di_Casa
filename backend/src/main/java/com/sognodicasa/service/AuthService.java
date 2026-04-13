package com.sognodicasa.service;

import com.sognodicasa.dto.LoginRequest;
import com.sognodicasa.dto.LoginResponse;
import com.sognodicasa.dto.RegisterRequest;
import com.sognodicasa.model.User;
import com.sognodicasa.repository.UserRepository;
import com.sognodicasa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 會員驗證服務：處理註冊與登入邏輯
 *
 * Service 層負責「商業邏輯」，不直接處理 HTTP 請求
 * Controller 呼叫 Service，Service 呼叫 Repository
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 註冊新會員
     * @return 登入 token（註冊成功後自動登入）
     */
    public LoginResponse register(RegisterRequest req) {
        // 檢查 Email 是否已被使用
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("此 Email 已被註冊");
        }

        // 用 BCrypt 把密碼加密（不可存明文！）
        // 例如：「password123」→「$2a$10$...」（無法反推回原始密碼）
        String hashedPassword = passwordEncoder.encode(req.getPassword());

        // 建立並儲存會員
        User user = new User(req.getName(), req.getEmail(), hashedPassword);
        userRepository.save(user);

        // 產生 JWT token 並回傳
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getName(), user.getEmail());
    }

    /**
     * 會員登入
     */
    public LoginResponse login(LoginRequest req) {
        // 查找會員
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("電子郵件或密碼錯誤"));

        // 比對密碼（BCrypt 雜湊比對）
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("電子郵件或密碼錯誤");
        }

        // 產生 JWT token 並回傳
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getName(), user.getEmail());
    }
}
