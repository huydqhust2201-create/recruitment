package com.example.be.service.inf;

import org.springframework.web.multipart.MultipartFile;

public interface CvTextExtractorService {

    String extractText(MultipartFile file);
}
