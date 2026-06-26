package com.example.be.service.inf;

import com.example.be.dto.cvbuilder.CvBuilderContent;
import com.example.be.entity.enums.CvTemplate;

public interface CvPdfGeneratorService {

    /**
     * Sinh file PDF (bytes) tu noi dung CV builder, theo 1 trong 3 mau (template).
     */
    byte[] generate(CvBuilderContent content, CvTemplate template);
}
