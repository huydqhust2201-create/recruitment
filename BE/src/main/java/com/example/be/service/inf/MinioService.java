package com.example.be.service.inf;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String uploadFile(MultipartFile file, String folder);

    // Dung cho file sinh ra trong code (vi du PDF CV builder), khong di tu MultipartFile
    String uploadBytes(byte[] data, String originalFileName, String contentType, String folder);

    void deleteFile(String fileUrl);

}
