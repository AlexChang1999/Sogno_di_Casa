package com.sognodicasa.service;

import com.sognodicasa.dto.ProductDto;
import com.sognodicasa.dto.ProductRequest;
import com.sognodicasa.model.Product;
import com.sognodicasa.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * 商品業務邏輯層
 * Controller 呼叫 Service，Service 呼叫 Repository
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    /** 取得所有商品（最新的排最前） */
    public List<ProductDto> findAll() {
        return productRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** 取得單一商品 */
    public ProductDto findById(Long id) {
        return productRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NoSuchElementException("找不到商品 id=" + id));
    }

    /** 新增商品 */
    public ProductDto create(ProductRequest req) {
        Product p = new Product();
        applyRequest(req, p);
        return toDto(productRepository.save(p));
    }

    /** 更新商品 */
    public ProductDto update(Long id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("找不到商品 id=" + id));
        applyRequest(req, p);
        return toDto(productRepository.save(p));
    }

    /** 刪除商品 */
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    // ── 私有輔助方法 ──

    /** 把 Request 的欄位複製到 Product 實體（null 不覆蓋） */
    private void applyRequest(ProductRequest req, Product p) {
        if (req.getName()        != null) p.setName(req.getName());
        if (req.getBrand()       != null) p.setBrand(req.getBrand());
        if (req.getCategory()    != null) p.setCategory(req.getCategory());
        if (req.getPrice()       != null) p.setPrice(req.getPrice());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getMainImage()   != null) p.setMainImage(req.getMainImage());
        if (req.getGalleryJson() != null) p.setGalleryJson(req.getGalleryJson());
        if (req.getInStock()     != null) p.setInStock(req.getInStock());
    }

    /** Product 實體 → ProductDto */
    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setDescription(p.getDescription());
        dto.setMainImage(p.getMainImage());
        dto.setGalleryJson(p.getGalleryJson());
        dto.setInStock(p.getInStock());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
