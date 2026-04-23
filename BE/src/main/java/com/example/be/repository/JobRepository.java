package com.example.be.repository;

import com.example.be.entity.Job;
import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // HR xem job cá»§a mÃ¬nh
    List<Job> findByRecruiterId(UUID recruiterId);

    // TÃ¬m kiáº¿m theo title + city + level
    @Query("""
        SELECT j FROM Job j
        WHERE j.status = 'ACTIVE'
        AND (:keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:city = '' OR LOWER(j.city) LIKE LOWER(CONCAT('%', :city, '%')))
        AND (:level IS NULL OR j.level = :level)
    """)
    Page<Job> search(
            @Param("keyword") String keyword,
            @Param("city")    String city,
            @Param("level")   JobLevel level,
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
}
