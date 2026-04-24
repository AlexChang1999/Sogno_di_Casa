package com.sognodicasa.controller;

import com.sognodicasa.dto.DesignerDto;
import com.sognodicasa.dto.DesignerRequest;
import com.sognodicasa.service.DesignerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * 設計師 API
 *
 * 公開端點（不需登入）：GET /api/designers、GET /api/designers/{id}
 * 管理員端點（需 ADMIN 角色）：POST、PUT、DELETE
 */
@RestController
@RequestMapping("/api/designers")
@RequiredArgsConstructor
public class DesignerController {

    private final DesignerService designerService;

    @GetMapping
    public ResponseEntity<List<DesignerDto>> getAll() {
        return ResponseEntity.ok(designerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesignerDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(designerService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesignerDto> create(@RequestBody DesignerRequest req) {
        return ResponseEntity.status(201).body(designerService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DesignerDto> update(@PathVariable Long id, @RequestBody DesignerRequest req) {
        return ResponseEntity.ok(designerService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        designerService.delete(id);
        return ResponseEntity.ok(Map.of("message", "設計師已刪除"));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
    }
}
