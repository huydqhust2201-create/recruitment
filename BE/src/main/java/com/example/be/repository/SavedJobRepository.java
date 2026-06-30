package com.example.be.repository;

import com.example.be.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {

    boolean existsByCandidateIdAndJobId(UUID candidateId, UUID jobId);

    Optional<SavedJob> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);

    @Query("SELECT s FROM SavedJob s JOIN FETCH s.job j JOIN FETCH j.company LEFT JOIN FETCH j.jobSkills js LEFT JOIN FETCH js.skill WHERE s.candidate.id = :candidateId ORDER BY s.savedAt DESC")
    List<SavedJob> findByCandidateIdWithJobs(@Param("candidateId") UUID candidateId);

    @Query("SELECT s.job.id FROM SavedJob s WHERE s.candidate.id = :candidateId")
    Set<UUID> findJobIdsByCandidateId(@Param("candidateId") UUID candidateId);
}
