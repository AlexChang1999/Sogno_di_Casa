package com.sognodicasa.service;

import com.sognodicasa.dto.LoginRequest;
import com.sognodicasa.dto.LoginResponse;
import com.sognodicasa.dto.RegisterRequest;
import com.sognodicasa.dto.SendCodeRequest;
import com.sognodicasa.model.User;
import com.sognodicasa.repository.UserRepository;
import com.sognodicasa.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 會員驗證服務：處理註冊、登入、Email 驗證碼邏輯
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.verification.expire-minutes:10}")
    private int expireMinutes;

    /**
     * 暫存待驗證的註冊資料
     * key   = email
     * value = [name, hashedPassword, code, expiresAt]
     *
     * ConcurrentHashMap：執行緒安全，多個請求同時存取不會出錯
     */
    private final Map<String, String[]> pendingRegistrations = new ConcurrentHashMap<>();

    /**
     * 步驟 1：發送 Email 驗證碼
     * 暫存 name + hashedPassword + code，等用戶輸入驗證碼後才正式建立帳號
     */
    public void sendVerificationCode(SendCodeRequest req) {
        // 檢查 Email 是否已被使用
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("此 Email 已被註冊");
        }

        // 產生 6 位數隨機驗證碼
        String code = String.format("%06d", new Random().nextInt(1_000_000));

        // 密碼先加密，暫存（不在記憶體中存明文）
        String hashedPwd = passwordEncoder.encode(req.getPassword());

        // 計算過期時間
        String expiresAt = LocalDateTime.now().plusMinutes(expireMinutes).toString();

        // 暫存到記憶體（若已有舊的驗證碼，覆蓋掉）
        pendingRegistrations.put(req.getEmail(), new String[]{
            req.getName(), hashedPwd, code, expiresAt
        });

        // 發送 Email
        emailService.sendVerificationCode(req.getEmail(), code);
    }

    /**
     * 步驟 2：驗證碼正確 → 正式建立帳號
     */
    public LoginResponse register(RegisterRequest req) {
        String email = req.getEmail();
        String code  = req.getCode();

        // 取出暫存資料
        String[] pending = pendingRegistrations.get(email);
        if (pending == null) {
            throw new IllegalArgumentException("請先發送驗證碼，或驗證碼已過期");
        }

        String name       = pending[0];
        String hashedPwd  = pending[1];
        String savedCode  = pending[2];
        String expiresAt  = pending[3];

        // 檢查驗證碼是否過期
        if (LocalDateTime.now().isAfter(LocalDateTime.parse(expiresAt))) {
            pendingRegistrations.remove(email);
            throw new IllegalArgumentException("驗證碼已過期，請重新發送");
        }

        // 比對驗證碼（不區分空白）
        if (!savedCode.equals(code.trim())) {
            throw new IllegalArgumentException("驗證碼錯誤，請再次確認");
        }

        // 再次確認 Email 是否已被搶先註冊
        if (userRepository.existsByEmail(email)) {
            pendingRegistrations.remove(email);
            throw new IllegalArgumentException("此 Email 已被註冊");
        }

        // 正式建立帳號
        User user = new User(name, email, hashedPwd);
        userRepository.save(user);

        // 清除暫存資料
        pendingRegistrations.remove(email);

        // 產生 JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        String role  = user.getRole() != null ? user.getRole() : "USER";
        return new LoginResponse(token, user.getName(), user.getEmail(), role);
    }

    /**
     * 會員登入
     */
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("電子郵件或密碼錯誤"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("電子郵件或密碼錯誤");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        String role  = user.getRole() != null ? user.getRole() : "USER";
        return new LoginResponse(token, user.getName(), user.getEmail(), role);
    }

    /**
     * 升級為管理員
     */
    public void makeAdmin(String email, String secret, String adminSetupSecret) {
        if (!adminSetupSecret.equals(secret)) {
            throw new IllegalArgumentException("管理員設定密碼錯誤");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("找不到此 Email：" + email));
        user.setRole("ADMIN");
        userRepository.save(user);
    }
}
