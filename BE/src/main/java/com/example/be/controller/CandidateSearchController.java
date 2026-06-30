package com.example.be.controller;

import com.example.be.dto.request.CandidateSearchRequest;
import com.example.be.dto.response.CandidateSearchResult;
import com.example.be.entity.Job;
import com.example.be.entity.enums.JobLevel;
import com.example.be.repository.CandidateProfileRepository;
import com.example.be.repository.JobRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class CandidateSearchController {

    private final CandidateProfileRepository candidateProfileRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    @PostMapping("/search-candidates")
    public ResponseEntity<List<CandidateSearchResult>> searchCandidates(
            @RequestBody CandidateSearchRequest request) {

        // Ưu tiên: nếu có jobId → AI matching dựa trên job thực tế
        if (request.getJobId() != null) {
            return ResponseEntity.ok(searchByJob(request.getJobId()));
        }

        // Fallback: tìm thủ công theo filters
        return ResponseEntity.ok(searchByFilters(request));
    }

    // Vector search khi job có jdEmbedding, fallback keyword khi không có
    private List<CandidateSearchResult> searchByJob(java.util.UUID jobId) {
        Job job = jobRepository.findByIdWithSkills(jobId).orElse(null);
        if (job == null) return List.of();

        // Nếu job có embedding → dùng pgvector cosine similarity (AI thực sự)
        if (job.getJdEmbedding() != null) {
            log.info("Vector matching: job={}, title={}", jobId, job.getTitle());
            List<Object[]> rows = candidateProfileRepository.findCandidatesByJobVector(jobId.toString());
            return rows.stream().map(row -> {
                List<String> skills = parseSkills(row[8]);
                double score = row[10] != null ? ((Number) row[10]).doubleValue() : 0.5;
                score = Math.max(0.0, Math.min(1.0, score));
                return buildResult(row, skills, score);
            }).collect(Collectors.toList());
        }

        // Fallback: dùng skills + city + level từ job để tìm keyword
        log.info("Keyword fallback matching: job={} (no embedding)", jobId);
        String skillKeyword = job.getJobSkills().stream()
                .map(js -> js.getSkill().getName())
                .findFirst().orElse(null);
        String city = job.getCity();
        int[] expRange = levelToExpRange(job.getLevel());

        List<Object[]> rows = candidateProfileRepository.searchCandidates(
                skillKeyword, city, expRange[0], expRange[1]);

        String allSkills = job.getJobSkills().stream()
                .map(js -> js.getSkill().getName().toLowerCase())
                .collect(Collectors.joining(" "));

        return rows.stream().map(row -> {
            List<String> skills = parseSkills(row[8]);
            double score = calcKeywordScore(allSkills, city, expRange[0], expRange[1], row, skills);
            return buildResult(row, skills, score);
        }).sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
          .collect(Collectors.toList());
    }

    // Tìm kiếm theo manual filters (không có jobId)
    private List<CandidateSearchResult> searchByFilters(CandidateSearchRequest request) {
        String keyword = blankToNull(request.getSkills());
        String city    = blankToNull(request.getCity());

        List<Object[]> rows = candidateProfileRepository.searchCandidates(
                keyword, city, request.getMinExp(), request.getMaxExp());

        List<CandidateSearchResult> results = new ArrayList<>();
        for (Object[] row : rows) {
            List<String> skills = parseSkills(row[8]);
            double score = calcKeywordScore(keyword, city, request.getMinExp(), request.getMaxExp(), row, skills);
            results.add(buildResult(row, skills, score));
        }
        results.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return results;
    }

    private CandidateSearchResult buildResult(Object[] row, List<String> skills, double score) {
        return CandidateSearchResult.builder()
                .id(str(row[0]))
                .fullName(str(row[1]))
                .email(str(row[2]))
                .headline(str(row[3]))
                .currentPosition(str(row[4]))
                .currentCompany(str(row[5]))
                .yearsOfExperience(row[6] != null ? ((Number) row[6]).intValue() : null)
                .city(str(row[7]))
                .skills(skills)
                .cvFileUrl(str(row[9]))
                .matchScore(score)
                .build();
    }

    // JobLevel → [minExp, maxExp] (null = không giới hạn)
    private int[] levelToExpRange(JobLevel level) {
        if (level == null) return new int[]{0, Integer.MAX_VALUE};
        return switch (level) {
            case INTERN  -> new int[]{0, 1};
            case JUNIOR  -> new int[]{0, 2};
            case MID     -> new int[]{2, 5};
            case SENIOR  -> new int[]{5, 10};
            case LEAD    -> new int[]{7, Integer.MAX_VALUE};
            case MANAGER -> new int[]{8, Integer.MAX_VALUE};
        };
    }

    private double calcKeywordScore(String keyword, String city, Integer minExp, Integer maxExp,
                                    Object[] row, List<String> skills) {
        double score = 0.4;
        String headline = str(row[3]);
        String position = str(row[4]);
        String rowCity  = str(row[7]);
        Integer exp     = row[6] != null ? ((Number) row[6]).intValue() : null;

        if (keyword != null && !keyword.isBlank()) {
            String[] kws = keyword.toLowerCase().split("[\\s,]+");
            for (String kw : kws) {
                if (headline != null && headline.toLowerCase().contains(kw)) score += 0.08;
                if (position != null && position.toLowerCase().contains(kw)) score += 0.05;
                long skillMatch = skills.stream().filter(s -> s.toLowerCase().contains(kw)).count();
                score += Math.min(skillMatch * 0.07, 0.14);
            }
        } else {
            score += 0.3;
        }
        if (city != null && !city.isBlank() && city.equalsIgnoreCase(rowCity)) score += 0.1;
        if (exp != null) {
            if (minExp != null && exp >= minExp) score += 0.05;
            if (maxExp != null && maxExp < Integer.MAX_VALUE && exp <= maxExp) score += 0.05;
        }
        return Math.min(score, 1.0);
    }

    private List<String> parseSkills(Object raw) {
        if (raw == null) return List.of();
        try {
            return objectMapper.readValue(raw.toString(), new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String str(Object o) { return o != null ? o.toString() : null; }
    private String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
}
