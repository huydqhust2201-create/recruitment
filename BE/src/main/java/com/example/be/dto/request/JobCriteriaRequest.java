package com.example.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.jpa.repository.Modifying;

@Data
public class JobCriteriaRequest {
    @NotNull(message = "Trá»ng sá»‘ kÄ© nÄƒng khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 0, message = "Trá»ng sá»‘ kÄ© nÄƒng pháº£i tá»« 0 Ä‘áº¿n 100")
    @Max(value = 100, message = "Trá»ng sá»‘ kÄ© nÄƒng pháº£i tá»« 0 Ä‘áº¿n 100")
    private Integer skillWeight;

    @NotNull(message = "Trá»ng sá»‘ kinh nghiá»‡m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 0,   message = "Trá»ng sá»‘ pháº£i tá»« 0 Ä‘áº¿n 100")
    @Max(value = 100, message = "Trá»ng sá»‘ pháº£i tá»« 0 Ä‘áº¿n 100")
    private Integer experienceWeight;

    @NotNull(message = "Trá»ng sá»‘ há»c váº¥n khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 0,   message = "Trá»ng sá»‘ pháº£i tá»« 0 Ä‘áº¿n 100")
    @Max(value = 100, message = "Trá»ng sá»‘ pháº£i tá»« 0 Ä‘áº¿n 100")
    private Integer educationWeight;

    @NotNull(message = "NgÆ°á»¡ng pass khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 0, message = "NgÆ°á»¡ng pháº£i tá»« 0 Ä‘áº¿n 1")
    @Max(value = 1, message = "NgÆ°á»¡ng pháº£i tá»« 0 Ä‘áº¿n 1")
    private Double passThreshold;

    private String customInstructions;
}

