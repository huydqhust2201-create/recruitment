package com.example.be.repository;

import com.example.be.entity.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, UUID> {

    List<ApplicationNote> findByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
