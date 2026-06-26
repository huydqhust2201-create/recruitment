package com.example.be.repository;

import com.example.be.entity.JobRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRecommendationRepository extends JpaRepository<JobRecommendation, UUID> {

    Optional<JobRecommendation> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
}
