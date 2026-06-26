package com.example.be.repository;

import com.example.be.entity.CompanySubscription;
import com.example.be.entity.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, UUID> {

    Optional<CompanySubscription> findTopByCompanyIdAndStatusOrderByCreatedAtDesc(
            UUID companyId, SubscriptionStatus status);

    List<CompanySubscription> findByCompanyIdOrderByCreatedAtDesc(UUID companyId);

    @Query("SELECT COUNT(s) FROM CompanySubscription s WHERE s.status = 'ACTIVE'")
    long countActive();
}
