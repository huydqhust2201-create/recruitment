package com.example.be.repository;

import com.example.be.entity.JobCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface JobCriteriaRepository extends JpaRepository<JobCriteria, UUID> {
    Optional<JobCriteria> findByJobId(UUID jobid);
    Boolean existsByJobId(UUID jobid);
}

