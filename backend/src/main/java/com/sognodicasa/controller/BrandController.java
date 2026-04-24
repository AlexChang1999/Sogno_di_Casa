package com.sognodicasa.controller;

import com.sognodicasa.dto.BrandDto;
import com.sognodicasa.dto.BrandRequest;
import com.sognodicasa.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * 品牌 API
 *
 * 公開端點（不需登入）：GET /api/brands、GET /api/brands/{id}
 * 管理員端點（需 ADMIN 角色）：POST、PUT、DELETE
 */
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDto>> getAll() {
        return ResponseEntity.ok(brandService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDto> create(@RequestBody BrandRequest req) {
        return ResponseEntity.status(201).body(brandService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandDto> update(@PathVariable Long id, @RequestBody BrandRequest req) {
        return ResponseEntity.ok(brandService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(Map.of("message", "品牌已刪除"));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }
}
