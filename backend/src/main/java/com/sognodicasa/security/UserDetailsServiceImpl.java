package com.sognodicasa.security;

import com.sognodicasa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security 用這個 Service 查詢使用者
 * 當 JwtFilter 解析出 email 後，會呼叫 loadUserByUsername 驗證
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.sognodicasa.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("找不到使用者：" + email));

        // 把我們的 User Entity 轉換成 Spring Security 的 UserDetails 格式
        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("USER") // 角色：一般會員
                .build();
    }
}
