package com.example.be.controller;

import com.example.be.dto.response.JobResponse;
import com.example.be.entity.Job;
import com.example.be.entity.SavedJob;
import com.example.be.entity.User;
import com.example.be.repository.JobRepository;
import com.example.be.repository.SavedJobRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/candidate/saved-jobs")
public class SavedJobController {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobService jobService;

    /** Save a job */
    @PostMapping("/{jobId}")
    public ResponseEntity<Map<String, Boolean>> save(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID candidateId = getCandidateId(userDetails);

        if (!savedJobRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
            User candidate = userRepository.getReferenceById(candidateId);
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            savedJobRepository.save(SavedJob.builder().candidate(candidate).job(job).build());
        }
        return ResponseEntity.ok(Map.of("saved", true));
    }

    /** Unsave a job */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Map<String, Boolean>> unsave(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID candidateId = getCandidateId(userDetails);
        savedJobRepository.findByCandidateIdAndJobId(candidateId, jobId)
                .ifPresent(savedJobRepository::delete);
        return ResponseEntity.ok(Map.of("saved", false));
    }

    /** Get all saved jobs (full details) */
    @GetMapping
    public ResponseEntity<List<JobResponse>> getSavedJobs(
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID candidateId = getCandidateId(userDetails);
        List<JobResponse> jobs = savedJobRepository.findByCandidateIdWithJobs(candidateId)
                .stream()
                .map(s -> jobService.toResponse(s.getJob()))
                .toList();
        return ResponseEntity.ok(jobs);
    }

    /** Get just the set of saved job IDs — for frontend bookmark state */
    @GetMapping("/ids")
    public ResponseEntity<Set<UUID>> getSavedJobIds(
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID candidateId = getCandidateId(userDetails);
        return ResponseEntity.ok(savedJobRepository.findJobIdsByCandidateId(candidateId));
    }

    private UUID getCandidateId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
