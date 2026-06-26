package com.example.be.repository;

import com.example.be.entity.CvParseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvParseResultRepository extends JpaRepository<CvParseResult, UUID> {

    Optional<CvParseResult> findByCvFileId(UUID cvFileId);
}
