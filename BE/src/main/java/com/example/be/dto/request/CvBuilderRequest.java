package com.example.be.dto.request;

import com.example.be.dto.cvbuilder.CvBuilderContent;
import com.example.be.entity.enums.CvTemplate;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CvBuilderRequest {

    private String title;

    @NotNull(message = "Template không được để trống")
    private CvTemplate template;

    @NotNull(message = "Nội dung CV không được để trống")
    private CvBuilderContent content;
}
