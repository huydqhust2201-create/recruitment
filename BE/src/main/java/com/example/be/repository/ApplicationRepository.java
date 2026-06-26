package com.example.be.repository;

import com.example.be.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    @Query(value = """
            SELECT * FROM applications
            WHERE job_id = :jobId
            ORDER BY ai_match_score DESC NULLS LAST, applied_at DESC
            """, nativeQuery = true)
    List<Application> findByJobIdOrderByAiMatchScoreDesc(@Param("jobId") UUID jobId);

    List<Application> findByCandidateIdOrderByAppliedAtDesc(UUID candidateId);

    boolean existsByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    Optional<Application> findByJobIdAndCandidateId(UUID jobId, UUID candidateId);

    Optional<Application> findByIdAndCandidateId(UUID id, UUID candidateId);

    @Query(value = """
            SELECT * FROM applications
            WHERE job_id IN (:jobIds)
            ORDER BY ai_match_score DESC NULLS LAST, applied_at DESC
            """, nativeQuery = true)
    List<Application> findByJobIdInOrderByScore(@Param("jobIds") List<UUID> jobIds);
}
