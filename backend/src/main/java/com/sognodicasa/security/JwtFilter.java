package com.sognodicasa.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 過濾器：每個 HTTP 請求進來時都會執行一次
 *
 * 流程：
 * 1. 讀取 Header 中的 Authorization: Bearer <token>
 * 2. 驗證 token 是否合法
 * 3. 合法的話，把使用者資訊放入 Spring Security 的上下文
 * 4. 後續 Controller 就能用 @AuthenticationPrincipal 取得當前使用者
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 讀取 Authorization header，格式：Bearer eyJhbGci...
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // 沒有 token，直接放行（讓 Security 決定是否需要登入）
            filterChain.doFilter(request, response);
            return;
        }

        // 去掉 "Bearer " 前綴，取得純 token 字串
        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            // token 無效（偽造或過期），放行讓後面的 Security 攔截
            filterChain.doFilter(request, response);
            return;
        }

        // token 合法 → 解析 email → 載入使用者資訊
        String email = jwtUtil.extractEmail(token);

        // 確保 SecurityContext 還沒有認證資訊（避免重複設定）
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // 建立認證物件，放入 SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
