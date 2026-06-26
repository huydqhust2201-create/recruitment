package com.example.be.repository;

import com.example.be.entity.AiScoreResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiScoreResultRepository extends JpaRepository<AiScoreResult, UUID> {

    Optional<AiScoreResult> findByApplicationId(UUID applicationId);
}
