package com.example.be.dto.cvbuilder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Cau truc noi dung 1 CV duoc tao bang CV Builder.
 * Duoc serialize thanh JSON va luu trong cv_builder_documents.content (jsonb).
 * Dung chung cho ca request va response de tranh trung lap.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CvBuilderContent {

    private PersonalInfo personalInfo;
    private List<EducationItem> educations;
    private List<ExperienceItem> experiences;
    private List<String> skills;
    private List<CertificationItem> certifications;
    private List<LanguageItem> languages;
    private List<ProjectItem> projects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalInfo {
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String headline;
        private String summary;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EducationItem {
        private String school;
        private String degree;
        private String major;
        private String startDate;
        private String endDate;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExperienceItem {
        private String company;
        private String position;
        private String startDate;
        private String endDate;
        private boolean current;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationItem {
        private String name;
        private String issuer;
        private String issuedDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LanguageItem {
        private String name;
        private String level;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectItem {
        private String name;
        private String description;
        private String techStack;
        private String link;
    }
}
