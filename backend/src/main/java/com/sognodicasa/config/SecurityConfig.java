package com.sognodicasa.config;

import com.sognodicasa.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 設定
 * 定義：哪些 API 需要登入、CORS 設定、密碼加密方式
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // 開啟 @PreAuthorize 支援，讓 Controller 可用 @PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 關閉 CSRF（我們用 JWT 取代，不需要 CSRF 保護）
            .csrf(csrf -> csrf.disable())

            // 套用 CORS 設定（允許前端跨域呼叫）
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 使用 Stateless Session（每次請求都靠 JWT 驗證，不存 Session）
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 設定哪些路徑需要登入
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()                          // 登入/註冊不需要 token
                .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll() // 瀏覽商品不需要登入
                .requestMatchers("/uploads/**").permitAll()                           // 上傳的圖片可公開存取
                .anyRequest().authenticated()                                         // 其他都需要 token
            )

            // 在 Spring Security 的帳密驗證之前，先執行我們的 JWT 驗證
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS 設定：允許前端網頁呼叫後端 API
     * 因為前端在 port 3333，後端在 port 8080，屬於不同來源（Cross-Origin）
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * BCrypt 密碼加密器
     * 密碼不能以明文存入資料庫，BCrypt 會把密碼加密成無法還原的雜湊值
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
