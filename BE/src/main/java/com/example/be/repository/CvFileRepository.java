package com.example.be.repository;

import com.example.be.entity.CvFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvFileRepository
        extends JpaRepository<CvFile, UUID> {

    // Lấy tất cả CV của 1 candidate
    List<CvFile> findByCandidateId(UUID candidateId);

    // Lấy CV chính
    Optional<CvFile> findByCandidateIdAndIsPrimaryTrue(UUID candidateId);

    // Đếm số CV đã upload
    int countByCandidateId(UUID candidateId);
}