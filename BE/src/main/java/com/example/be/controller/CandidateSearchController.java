package com.example.be.controller;

import com.example.be.dto.request.CandidateSearchRequest;
import com.example.be.dto.response.CandidateSearchResult;
import com.example.be.repository.CandidateProfileRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
public class CandidateSearchController {

    private final CandidateProfileRepository candidateProfileRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/search-candidates")
    public ResponseEntity<List<CandidateSearchResult>> searchCandidates(
            @RequestBody CandidateSearchRequest request) {

        String keyword = blankToNull(request.getSkills());
        String city    = blankToNull(request.getCity());

        List<Object[]> rows = candidateProfileRepository.searchCandidates(
                keyword, city, request.getMinExp(), request.getMaxExp());

        List<CandidateSearchResult> results = new ArrayList<>();
        for (Object[] row : rows) {
            List<String> skills = parseSkills(row[8]);
            double score = calcScore(keyword, city, request.getMinExp(), request.getMaxExp(), row, skills);
            results.add(CandidateSearchResult.builder()
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
                    .build());
        }

        results.sort((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()));
        return ResponseEntity.ok(results);
    }

    private double calcScore(String keyword, String city, Integer minExp, Integer maxExp,
                             Object[] row, List<String> skills) {
        double score = 0.4; // base
        String headline = str(row[3]);
        String position = str(row[4]);
        String rowCity  = str(row[7]);
        Integer exp     = row[6] != null ? ((Number) row[6]).intValue() : null;

        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.toLowerCase();
            if (headline != null && headline.toLowerCase().contains(kw)) score += 0.25;
            if (position != null && position.toLowerCase().contains(kw)) score += 0.15;
            long skillMatch = skills.stream().filter(s -> s.toLowerCase().contains(kw)).count();
            score += Math.min(skillMatch * 0.1, 0.2);
        } else {
            score += 0.3; // no keyword filter = neutral bonus
        }
        if (city != null && !city.isBlank() && city.equalsIgnoreCase(rowCity)) score += 0.1;
        if (exp != null) {
            if (minExp != null && exp >= minExp) score += 0.05;
            if (maxExp != null && exp <= maxExp) score += 0.05;
        }
        return Math.min(score, 1.0);
    }

    private List<String> parseSkills(Object raw) {
        if (raw == null) return List.of();
        try {
            String json = raw.toString();
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String str(Object o) { return o != null ? o.toString() : null; }
    private String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s.trim(); }
}
