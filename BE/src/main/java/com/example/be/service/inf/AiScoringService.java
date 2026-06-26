package com.example.be.service.inf;

import com.example.be.dto.response.AiScoreResponse;

import java.util.UUID;

public interface AiScoringService {

    void scoreApplicationAsync(UUID applicationId);

    AiScoreResponse scoreApplication(UUID applicationId);

    AiScoreResponse getScoreForRecruiter(UUID applicationId, UUID recruiterUserId);

    AiScoreResponse getScoreForCandidate(UUID applicationId, UUID candidateUserId);
}
