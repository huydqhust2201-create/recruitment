package com.example.be.repository;

import com.example.be.entity.StageTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StageTransitionRepository extends JpaRepository<StageTransition, UUID> {

    List<StageTransition> findByApplicationIdOrderByChangedAtDesc(UUID applicationId);
}
