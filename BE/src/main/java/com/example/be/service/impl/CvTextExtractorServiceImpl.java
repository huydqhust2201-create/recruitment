package com.example.be.service.impl;

import com.example.be.service.inf.CvTextExtractorService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class CvTextExtractorServiceImpl implements CvTextExtractorService {

    private static final int MAX_TEXT_LENGTH = 12000;

    @Override
    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String fileName = file.getOriginalFilename();
        String ext = fileName != null && fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
                : "";

        try {
            String text = switch (ext) {
                case "pdf" -> extractPdfText(file.getBytes());
                case "doc", "docx" -> fallbackText(fileName);
                default -> fallbackText(fileName);
            };
            return truncate(text);
        } catch (Exception e) {
            log.warn("Khong extract duoc text tu CV: {}", e.getMessage());
            return fallbackText(fileName);
        }
    }

    private String extractPdfText(byte[] bytes) throws Exception {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String fallbackText(String fileName) {
        return "CV file: " + (fileName != null ? fileName : "unknown");
    }

    private String truncate(String text) {
        if (text == null) {
            return null;
        }
        String normalized = text.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= MAX_TEXT_LENGTH) {
            return normalized;
        }
        return normalized.substring(0, MAX_TEXT_LENGTH);
    }
}
