package com.example.be.service.impl;

import com.example.be.service.inf.MinioService;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    // URL công khai (R2.dev hoặc custom domain). Nếu trống → dùng minioUrl/bucket/file (local)
    @Value("${minio.public-url:}")
    private String publicUrl;

    private static final String PUBLIC_READ_POLICY = """
            {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
            """;

    @PostConstruct
    public void ensureBucketPublic() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Đã tạo bucket: {}", bucket);
            }
            String policy = PUBLIC_READ_POLICY.formatted(bucket).strip();
            minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
            log.info("Bucket {} đã được set public-read", bucket);
        } catch (Exception e) {
            log.warn("Không thể set bucket policy (bỏ qua): {}", e.getMessage());
        }
    }

    /**
     * Upload file lên MinIO
     * Trả về URL public của file
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // 1. Tạo tên file unique để tránh trùng
            String originalName = file.getOriginalFilename();
            String extension = getExtension(originalName);
            String fileName = folder + "/" + UUID.randomUUID() + "." + extension;

            // 2. Upload lên MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileName)
                            .stream(file.getInputStream(),
                                    file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            // 3. Trả về URL công khai
            String fileUrl = buildPublicUrl(fileName);
            log.info("Upload thành công: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("Lỗi upload MinIO: {}", e.getMessage());
            throw new RuntimeException("Không thể upload file: "
                    + e.getMessage());
        }
    }

    /**
     * Upload bytes sinh ra trong code (vi du PDF CV builder) len MinIO.
     * Tra ve URL public cua file, giong uploadFile(MultipartFile, folder).
     */
    public String uploadBytes(byte[] data, String originalFileName, String contentType, String folder) {
        try {
            String extension = getExtension(originalFileName);
            String fileName = folder + "/" + UUID.randomUUID() + "." + extension;

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(fileName)
                            .stream(new java.io.ByteArrayInputStream(data),
                                    data.length, -1)
                            .contentType(contentType)
                            .build()
            );

            String fileUrl = buildPublicUrl(fileName);
            log.info("Upload thành công: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("Lỗi upload MinIO: {}", e.getMessage());
            throw new RuntimeException("Không thể upload file: " + e.getMessage());
        }
    }

    /**
     * Xóa file khỏi MinIO
     */
    public void deleteFile(String fileUrl) {
        try {
            // Lấy object name từ URL
            String objectName = extractObjectName(fileUrl);

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectName)
                            .build()
            );
            log.info("Đã xóa file: {}", objectName);

        } catch (Exception e) {
            log.error("Lỗi xóa file MinIO: {}", e.getMessage());
        }
    }

    // Lấy extension từ tên file
    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "pdf";
        return fileName.substring(fileName.lastIndexOf(".") + 1)
                .toLowerCase();
    }

    // R2.dev: https://pub-xxx.r2.dev/<folder/file>  (không có bucket trong path)
    // Local MinIO: http://localhost:9000/<bucket>/<folder/file>
    private String buildPublicUrl(String objectPath) {
        if (publicUrl != null && !publicUrl.isBlank()) {
            return publicUrl.stripTrailing() + "/" + objectPath;
        }
        return minioUrl + "/" + bucket + "/" + objectPath;
    }

    private String extractObjectName(String fileUrl) {
        if (publicUrl != null && !publicUrl.isBlank() && fileUrl.startsWith(publicUrl)) {
            return fileUrl.replace(publicUrl.stripTrailing() + "/", "");
        }
        return fileUrl.replace(minioUrl + "/" + bucket + "/", "");
    }
}