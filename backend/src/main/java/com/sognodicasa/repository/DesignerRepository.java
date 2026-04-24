package com.sognodicasa.repository;

import com.sognodicasa.model.Designer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 設計師資料庫存取層
 */
@Repository
public interface DesignerRepository extends JpaRepository<Designer, Long> {

    /** 依 sortOrder 升冪、再依 name 升冪排序 */
    List<Designer> findAllByOrderBySortOrderAscNameAsc();

    /** 依姓名查詢（seed data 防重複用） */
    Optional<Designer> findByName(String name);
}
