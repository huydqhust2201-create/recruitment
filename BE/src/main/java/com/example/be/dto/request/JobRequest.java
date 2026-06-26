package com.example.be.dto.request;

import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class JobRequest {

    @NotBlank(message = "TiÃªu Ä‘á» khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String title;

    @NotBlank(message = "MÃ´ táº£ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String description;

    private String requirements;
    private String benefits;

    @NotNull(message = "Loáº¡i cÃ´ng viá»‡c khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private JobType jobType;

    @NotNull(message = "Cáº¥p Ä‘á»™ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private JobLevel level;

    private String industry;
    private String city;
    private Long salaryMin;
    private Long salaryMax;
    private boolean isSalaryPublic = true;
    private LocalDate deadline;

    // Danh sÃ¡ch skill yÃªu cáº§u
    private List<JobSkillRequest> skills;

    @Data
    public static class JobSkillRequest {
        private String skillName;
        private boolean isRequired;
        private String level;
    }
}
