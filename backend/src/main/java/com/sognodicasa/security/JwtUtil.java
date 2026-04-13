package com.sognodicasa.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * JWT（JSON Web Token）工具類
 *
 * JWT 是什麼？
 * - 登入成功後，伺服器發給使用者一個「通行證」（token）
 * - 之後每次呼叫 API 時，把這個 token 帶在 Header 裡
 * - 伺服器驗證 token 合法後，就知道是誰在呼叫
 * - 不需要 session，每次都是無狀態驗證（Stateless）
 */
@Component
public class JwtUtil {

    // 從 application.properties 讀取設定值
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration; // 毫秒

    // 取得簽名用的 Key（用 secret 產生）
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 產生 JWT token
     * @param email 會員的 Email（作為 token 的識別主體）
     * @return JWT 字串，格式：header.payload.signature
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)                              // 存放 email
                .setIssuedAt(new Date())                        // 發行時間
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // 過期時間
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 用 HS256 演算法簽名
                .compact();
    }

    /**
     * 從 token 中解析出 email
     */
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * 驗證 token 是否合法（格式正確、未過期、簽名正確）
     */
    public boolean validateToken(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
