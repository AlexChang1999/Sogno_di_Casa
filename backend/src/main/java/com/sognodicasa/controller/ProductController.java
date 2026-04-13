package com.sognodicasa.controller;

import com.sognodicasa.dto.ProductDto;
import com.sognodicasa.dto.ProductRequest;
import com.sognodicasa.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * 商品 API
 *
 * 公開端點（不需登入）：GET /api/products、GET /api/products/{id}
 * 管理員端點（需 ADMIN 角色）：POST、PUT、DELETE、upload-image
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 從 application.properties 讀取圖片上傳目錄
    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    // ── 公開 API ──

    /** GET /api/products — 取得所有商品（公開） */
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    /** GET /api/products/{id} — 取得單一商品（公開） */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    // ── 管理員 API（需要 ADMIN 角色，由 @PreAuthorize 控制）──

    /** POST /api/products — 新增商品 */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> create(@RequestBody ProductRequest req) {
        return ResponseEntity.status(201).body(productService.create(req));
    }

    /** PUT /api/products/{id} — 更新商品 */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    /** DELETE /api/products/{id} — 刪除商品 */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(Map.of("message", "商品已刪除"));
    }

    /**
     * POST /api/products/upload-image — 上傳圖片（multipart/form-data）
     * 圖片儲存到 ./uploads/ 資料夾，回傳可存取的 URL
     */
    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        // 建立 uploads 資料夾（若不存在）
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        // 產生唯一檔名，避免覆蓋
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null || ext.isEmpty()) ext = "jpg";
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest);

        // 回傳可公開存取的 URL
        String url = "http://localhost:" + serverPort + "/uploads/" + filename;
        return ResponseEntity.ok(Map.of("url", url));
    }

    // 全域例外處理
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }
}
