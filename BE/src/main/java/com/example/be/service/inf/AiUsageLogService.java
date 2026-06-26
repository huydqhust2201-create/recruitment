package com.example.be.service.inf;

import com.example.be.entity.enums.AiFeature;

import java.util.UUID;

public interface AiUsageLogService {

    void logUsage(UUID userId, AiFeature feature, int tokensInput, int tokensOutput, boolean success);
}
