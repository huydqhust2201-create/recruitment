package com.example.be.repository;

import com.example.be.entity.CvBuilderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvBuilderDocumentRepository extends JpaRepository<CvBuilderDocument, UUID> {

    List<CvBuilderDocument> findByCandidateIdOrderByUpdatedAtDesc(UUID candidateId);

    Optional<CvBuilderDocument> findByIdAndCandidateId(UUID id, UUID candidateId);
}
