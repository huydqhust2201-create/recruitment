package com.example.be.repository;

import com.example.be.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VectorSearchRepository extends JpaRepository<Job, UUID> {

    @Query(value = """
            SELECT j.id,
                   (1 - (j.jd_embedding <=> CAST(:embedding AS vector))) AS similarity_score
            FROM jobs j
            WHERE j.status = 'ACTIVE'
              AND j.jd_embedding IS NOT NULL
            ORDER BY j.jd_embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    java.util.List<Object[]> findSimilarJobIds(
            @Param("embedding") String embedding,
            @Param("limit") int limit);

    @Query(value = """
            SELECT 1 - (cp.cv_embedding <=> j.jd_embedding)
            FROM candidate_profiles cp, jobs j
            WHERE cp.user_id = :candidateUserId
              AND j.id = :jobId
              AND cp.cv_embedding IS NOT NULL
              AND j.jd_embedding IS NOT NULL
            """, nativeQuery = true)
    Optional<Double> computeVectorSimilarity(
            @Param("candidateUserId") UUID candidateUserId,
            @Param("jobId") UUID jobId);
}
