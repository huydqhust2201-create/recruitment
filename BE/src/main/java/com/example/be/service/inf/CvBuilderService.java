package com.example.be.service.inf;

import com.example.be.dto.request.CvBuilderRequest;
import com.example.be.dto.response.CvBuilderResponse;
import com.example.be.dto.response.CvFileResponse;

import java.util.List;
import java.util.UUID;

public interface CvBuilderService {

    List<CvBuilderResponse> getMyDocuments(UUID userId);

    CvBuilderResponse getById(UUID userId, UUID id);

    CvBuilderResponse create(UUID userId, CvBuilderRequest request);

    CvBuilderResponse update(UUID userId, UUID id, CvBuilderRequest request);

    void delete(UUID userId, UUID id);

    CvFileResponse exportToPdf(UUID userId, UUID id);
}
