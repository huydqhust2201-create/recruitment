package com.example.be.repository;

import com.example.be.entity.Job;
import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobStatus;
import com.example.be.entity.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    Optional<Job> findBySlug(String slug);

    boolean existsBySlug(String slug);

    // Láº¥y táº¥t cáº£ job Ä‘ang active â€” á»©ng viÃªn xem
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    // HR xem job của mình
    List<Job> findByRecruiterId(UUID recruiterId);

    List<Job> findByCompanyIdAndStatus(UUID companyId, JobStatus status);

    @Query("""
    SELECT DISTINCT j FROM Job j
    LEFT JOIN FETCH j.jobSkills js
    LEFT JOIN FETCH js.skill
    WHERE j.recruiter.id = :recruiterId
""")
    List<Job> findByRecruiterIdWithSkills(@Param("recruiterId") UUID recruiterId);

    // Tìm kiếm theo title + city + level + industry + jobType + salaryMin
    @Query("""
        SELECT j FROM Job j
        WHERE j.status = 'ACTIVE'
        AND (:keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:city = '' OR LOWER(j.city) LIKE LOWER(CONCAT('%', :city, '%')))
        AND (:level IS NULL OR j.level = :level)
        AND (:industry = '' OR j.industry = :industry)
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:salaryMin IS NULL OR j.isSalaryPublic = false OR j.salaryMax >= :salaryMin)
    """)
    Page<Job> search(
            @Param("keyword")   String keyword,
            @Param("city")      String city,
            @Param("level")     JobLevel level,
            @Param("industry")  String industry,
            @Param("jobType")   JobType jobType,
            @Param("salaryMin") Long salaryMin,
            Pageable pageable
    );
    // fetch cáº£ jobSkills khi fetch jobs
    @Query("""
    SELECT DISTINCT j FROM Job j
    LEFT JOIN FETCH j.jobSkills js
    LEFT JOIN FETCH js.skill
    WHERE j.id = :id
""")
    Optional<Job> findByIdWithSkills(@Param("id") UUID id);

    @Query("""
    SELECT DISTINCT j FROM Job j
    LEFT JOIN FETCH j.jobSkills js
    LEFT JOIN FETCH js.skill
    WHERE j.slug = :slug
""")
    Optional<Job> findBySlugWithSkills(@Param("slug") String slug);

    @Modifying
    @Transactional
    @Query(value = "UPDATE jobs SET jd_embedding = CAST(:embedding AS vector) WHERE id = CAST(:id AS uuid)", nativeQuery = true)
    void updateEmbedding(@Param("id") String id, @Param("embedding") String embedding);

    @Query(value = "SELECT * FROM jobs WHERE status = 'ACTIVE' AND jd_embedding IS NULL", nativeQuery = true)
    List<Job> findJobsWithoutEmbedding();

    @Query(value = """
            SELECT j.id,
                   (1 - (j.jd_embedding <=> CAST(:embedding AS vector))) AS similarity_score
            FROM jobs j
            WHERE j.status = 'ACTIVE'
              AND j.jd_embedding IS NOT NULL
            ORDER BY j.jd_embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findSimilarJobs(
            @Param("embedding") String embedding,
            @Param("limit") int limit);
}
