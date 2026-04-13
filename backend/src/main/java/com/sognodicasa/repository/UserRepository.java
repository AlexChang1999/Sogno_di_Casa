package com.sognodicasa.repository;

import com.sognodicasa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * UserRepository 繼承 JpaRepository，Spring 會自動實作
 * 不需要寫 SQL，只要宣告方法名稱，JPA 就會自動產生對應查詢
 *
 * JpaRepository<User, Long>：
 *   - User = 操作的 Entity 類型
 *   - Long = 主鍵的型別
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // 自動產生：SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // 自動產生：SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
}
