package com.sognodicasa.service;

import com.sognodicasa.dto.DesignerDto;
import com.sognodicasa.dto.DesignerRequest;
import com.sognodicasa.model.Designer;
import com.sognodicasa.repository.DesignerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * 設計師業務邏輯層
 */
@Service
@RequiredArgsConstructor
public class DesignerService {

    private final DesignerRepository designerRepository;

    public List<DesignerDto> findAll() {
        return designerRepository.findAllByOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DesignerDto findById(Long id) {
        return designerRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NoSuchElementException("找不到設計師 id=" + id));
    }

    public DesignerDto create(DesignerRequest req) {
        Designer d = new Designer();
        applyRequest(req, d);
        return toDto(designerRepository.save(d));
    }

    public DesignerDto update(Long id, DesignerRequest req) {
        Designer d = designerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("找不到設計師 id=" + id));
        applyRequest(req, d);
        return toDto(designerRepository.save(d));
    }

    public void delete(Long id) {
        designerRepository.deleteById(id);
    }

    private void applyRequest(DesignerRequest req, Designer d) {
        if (req.getName()              != null) d.setName(req.getName());
        if (req.getNationality()       != null) d.setNationality(req.getNationality());
        if (req.getBirthYear()         != null) d.setBirthYear(req.getBirthYear());
        if (req.getDeathYear()         != null) d.setDeathYear(req.getDeathYear());
        if (req.getTagline()           != null) d.setTagline(req.getTagline());
        if (req.getBiography()         != null) d.setBiography(req.getBiography());
        if (req.getPortraitUrl()       != null) d.setPortraitUrl(req.getPortraitUrl());
        if (req.getAssociatedBrands()  != null) d.setAssociatedBrands(req.getAssociatedBrands());
        if (req.getFamousWorks()       != null) d.setFamousWorks(req.getFamousWorks());
        if (req.getSortOrder()         != null) d.setSortOrder(req.getSortOrder());
    }

    private DesignerDto toDto(Designer d) {
        DesignerDto dto = new DesignerDto();
        dto.setId(d.getId());
        dto.setName(d.getName());
        dto.setNationality(d.getNationality());
        dto.setBirthYear(d.getBirthYear());
        dto.setDeathYear(d.getDeathYear());
        dto.setTagline(d.getTagline());
        dto.setBiography(d.getBiography());
        dto.setPortraitUrl(d.getPortraitUrl());
        dto.setAssociatedBrands(d.getAssociatedBrands());
        dto.setFamousWorks(d.getFamousWorks());
        dto.setSortOrder(d.getSortOrder());
        dto.setCreatedAt(d.getCreatedAt());
        return dto;
    }
}
