package com.example.be.repository;

import com.example.be.entity.Company;
import com.example.be.entity.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterProfileRepository
        extends JpaRepository<RecruiterProfile, UUID> {

    Optional<RecruiterProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Query("SELECT rp.company FROM RecruiterProfile rp WHERE rp.user.id = :userId AND rp.company IS NOT NULL")
    Optional<Company> findCompanyByUserId(@Param("userId") UUID userId);

    @Query("SELECT rp FROM RecruiterProfile rp JOIN FETCH rp.user WHERE rp.company.id = :companyId")
    Optional<com.example.be.entity.RecruiterProfile> findByCompanyId(@Param("companyId") UUID companyId);
}
