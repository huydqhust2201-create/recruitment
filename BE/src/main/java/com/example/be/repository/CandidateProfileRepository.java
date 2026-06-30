package com.example.be.repository;

import com.example.be.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateProfileRepository
        extends JpaRepository<CandidateProfile, UUID> {

    Optional<CandidateProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Query(value = """
            SELECT cp.id::text       AS profileId,
                   u.full_name       AS fullName,
                   u.email           AS email,
                   cp.headline       AS headline,
                   cp.current_position AS currentPosition,
                   cp.current_company  AS currentCompany,
                   cp.years_of_experience AS yearsOfExp,
                   cp.city           AS city,
                   cpr.parsed_skills AS parsedSkills,
                   cf.file_url       AS cvFileUrl
            FROM candidate_profiles cp
            JOIN users u ON u.id = cp.user_id
            LEFT JOIN cv_files cf ON cf.candidate_id = cp.id AND cf.is_primary = true
            LEFT JOIN cv_parse_results cpr ON cpr.cv_file_id = cf.id
            WHERE u.is_active = true
              AND (:city IS NULL OR :city = '' OR cp.city ILIKE :city)
              AND (:minExp IS NULL OR cp.years_of_experience >= :minExp)
              AND (:maxExp IS NULL OR cp.years_of_experience <= :maxExp)
              AND (
                  :keyword IS NULL OR :keyword = ''
                  OR cp.headline ILIKE CONCAT('%', :keyword, '%')
                  OR cp.current_position ILIKE CONCAT('%', :keyword, '%')
                  OR cp.bio ILIKE CONCAT('%', :keyword, '%')
                  OR CAST(cpr.parsed_skills AS TEXT) ILIKE CONCAT('%', :keyword, '%')
              )
            ORDER BY cp.years_of_experience DESC NULLS LAST,
                     cp.profile_completeness DESC NULLS LAST
            LIMIT 30
            """, nativeQuery = true)
    List<Object[]> searchCandidates(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("minExp") Integer minExp,
            @Param("maxExp") Integer maxExp
    );

    // Vector similarity search: tìm ứng viên phù hợp nhất với 1 job dựa trên CV embedding
    @Query(value = """
            SELECT cp.id::text,
                   u.full_name,
                   u.email,
                   cp.headline,
                   cp.current_position,
                   cp.current_company,
                   cp.years_of_experience,
                   cp.city,
                   cpr.parsed_skills,
                   cf.file_url,
                   1 - (cp.cv_embedding <=> j.jd_embedding) AS similarity_score
            FROM candidate_profiles cp
            JOIN users u ON u.id = cp.user_id
            CROSS JOIN jobs j
            LEFT JOIN cv_files cf ON cf.candidate_id = cp.id AND cf.is_primary = true
            LEFT JOIN cv_parse_results cpr ON cpr.cv_file_id = cf.id
            WHERE j.id = CAST(:jobId AS uuid)
              AND j.jd_embedding IS NOT NULL
              AND cp.cv_embedding IS NOT NULL
              AND u.is_active = true
            ORDER BY cp.cv_embedding <=> j.jd_embedding
            LIMIT 20
            """, nativeQuery = true)
    List<Object[]> findCandidatesByJobVector(@Param("jobId") String jobId);
}