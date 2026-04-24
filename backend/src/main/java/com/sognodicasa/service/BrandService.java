package com.sognodicasa.service;

import com.sognodicasa.dto.BrandDto;
import com.sognodicasa.dto.BrandRequest;
import com.sognodicasa.model.Brand;
import com.sognodicasa.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * 品牌業務邏輯層
 */
@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    /** 取得所有品牌（依排序值） */
    public List<BrandDto> findAll() {
        return brandRepository.findAllByOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /** 取得單一品牌 */
    public BrandDto findById(Long id) {
        return brandRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NoSuchElementException("找不到品牌 id=" + id));
    }

    /** 新增品牌 */
    public BrandDto create(BrandRequest req) {
        Brand b = new Brand();
        applyRequest(req, b);
        return toDto(brandRepository.save(b));
    }

    /** 更新品牌 */
    public BrandDto update(Long id, BrandRequest req) {
        Brand b = brandRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("找不到品牌 id=" + id));
        applyRequest(req, b);
        return toDto(brandRepository.save(b));
    }

    /** 刪除品牌 */
    public void delete(Long id) {
        brandRepository.deleteById(id);
    }

    // ── 私有輔助方法 ──

    private void applyRequest(BrandRequest req, Brand b) {
        if (req.getName()           != null) b.setName(req.getName());
        if (req.getCountry()        != null) b.setCountry(req.getCountry());
        if (req.getFoundedYear()    != null) b.setFoundedYear(req.getFoundedYear());
        if (req.getTagline()        != null) b.setTagline(req.getTagline());
        if (req.getDescription()    != null) b.setDescription(req.getDescription());
        if (req.getLogoUrl()        != null) b.setLogoUrl(req.getLogoUrl());
        if (req.getCoverImageUrl()  != null) b.setCoverImageUrl(req.getCoverImageUrl());
        if (req.getWebsiteUrl()     != null) b.setWebsiteUrl(req.getWebsiteUrl());
        if (req.getSortOrder()      != null) b.setSortOrder(req.getSortOrder());
    }

    private BrandDto toDto(Brand b) {
        BrandDto dto = new BrandDto();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setCountry(b.getCountry());
        dto.setFoundedYear(b.getFoundedYear());
        dto.setTagline(b.getTagline());
        dto.setDescription(b.getDescription());
        dto.setLogoUrl(b.getLogoUrl());
        dto.setCoverImageUrl(b.getCoverImageUrl());
        dto.setWebsiteUrl(b.getWebsiteUrl());
        dto.setSortOrder(b.getSortOrder());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
