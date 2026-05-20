package com.example.be.service.inf;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String uploadFile(MultipartFile file, String folder);
    void deleteFile(String fileUrl);

}
