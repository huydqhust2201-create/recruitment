package com.example.be.repository;

import com.example.be.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID> {
}
