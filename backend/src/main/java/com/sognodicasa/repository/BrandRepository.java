package com.sognodicasa.repository;

import com.sognodicasa.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 品牌資料庫存取層
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    /** 依 sortOrder 升冪、再依 name 升冪排序（A→Z） */
    List<Brand> findAllByOrderBySortOrderAscNameAsc();

    /** 依名稱查詢（seed data 防重複用） */
    Optional<Brand> findByName(String name);
}
