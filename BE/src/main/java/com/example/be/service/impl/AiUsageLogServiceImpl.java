package com.example.be.service.impl;

import com.example.be.entity.AiUsageLog;
import com.example.be.entity.User;
import com.example.be.entity.enums.AiFeature;
import com.example.be.repository.AiUsageLogRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.AiUsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AiUsageLogServiceImpl implements AiUsageLogService {

    private final AiUsageLogRepository aiUsageLogRepository;
    private final UserRepository userRepository;

    @Override
    public void logUsage(UUID userId, AiFeature feature, int tokensInput, int tokensOutput, boolean success) {
        User user = userId != null
                ? userRepository.findById(userId).orElse(null)
                : null;

        int totalTokens = tokensInput + tokensOutput;
        double costUsd = estimateCost(feature, tokensInput, tokensOutput);

        aiUsageLogRepository.save(AiUsageLog.builder()
                .user(user)
                .feature(feature)
                .tokensInput(tokensInput)
                .tokensOutput(tokensOutput)
                .costUsd(costUsd)
                .success(success)
                .build());
    }

    private double estimateCost(AiFeature feature, int tokensInput, int tokensOutput) {
        return switch (feature) {
            case CV_EMBED, JD_EMBED -> totalTokens(tokensInput, tokensOutput) * 0.00000002;
            case CV_SCORE -> totalTokens(tokensInput, tokensOutput) * 0.0000015;
            default -> totalTokens(tokensInput, tokensOutput) * 0.000001;
        };
    }

    private int totalTokens(int input, int output) {
        return Math.max(0, input) + Math.max(0, output);
    }
}
