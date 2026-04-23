package com.example.be.service.inf;

import com.example.be.dto.request.CompanyRequest;
import com.example.be.dto.response.CompanyResponse;

import java.util.UUID;

public interface CompanyService {
    CompanyResponse create(CompanyRequest request, UUID userId);
    CompanyResponse getById(UUID id);
    CompanyResponse getBySlug(String slug);
    CompanyResponse update(UUID id, CompanyRequest request, UUID userId);
}
