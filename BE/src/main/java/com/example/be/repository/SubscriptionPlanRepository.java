package com.example.be.repository;

import com.example.be.entity.SubscriptionPlan;
import com.example.be.entity.enums.PlanCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {
    Optional<SubscriptionPlan> findByCode(PlanCode code);
}
