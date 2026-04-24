package com.sognodicasa.repository;

import com.sognodicasa.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 商品資料庫存取層
 * JpaRepository 自動提供 findAll、findById、save、deleteById 等方法
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // 依建立時間倒序排列（最新的排最前）
    List<Product> findAllByOrderByCreatedAtDesc();

    // 查詢本季主打商品
    List<Product> findByIsFeaturedTrue();

    // 查詢設計經典商品
    List<Product> findByIsClassicTrue();

    // 查詢 Hero 大輪播商品
    List<Product> findByIsHeroTrue();
}
