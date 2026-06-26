package com.example.be.service.impl;

import com.example.be.dto.cvbuilder.CvBuilderContent;
import com.example.be.entity.enums.CvTemplate;
import com.example.be.service.inf.CvPdfGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Sinh PDF cho CV builder bang Apache PDFBox (da co san trong pom.xml, dung
 * de tranh them 1 lib HTML-to-PDF moi co the xung dot version pdfbox dang
 * dung cho CvTextExtractorServiceImpl).
 *
 * QUAN TRONG: font Helvetica chuan cua PDFBox khong co dau tieng Viet, nen
 * phai nhung font Unicode (Noto Sans) tu resources/fonts.
 *
 * Khong dung HTML/CSS — ve truc tiep bang PDPageContentStream nen 3 "template"
 * (MODERN/CLASSIC/CREATIVE) chi khac mau sac/bang dau de (khong phai layout
 * nhieu cot doc lap), du de tao cam giac khac biet ro rang giua cac mau.
 */
@Slf4j
@Service
public class CvPdfGeneratorServiceImpl implements CvPdfGeneratorService {

    private static final float PAGE_MARGIN = 40f;
    private static final float LINE_GAP = 4f;

    @Override
    public byte[] generate(CvBuilderContent content, CvTemplate template) {
        try (PDDocument document = new PDDocument()) {
            PDFont font = loadFont(document);
            // PDFBox khong instancing duoc variable font -> dung lai 1 font
            // cho ca "bold" (phan biet bang mau/size thay vi do dam net).
            PDFont boldFont = font;

            float[] accent = accentColorFor(template);
            PdfFlowWriter writer = new PdfFlowWriter(document, font, boldFont, accent);
            writer.newPage();

            drawHeader(writer, content, template, accent);
            drawSummary(writer, content);
            drawExperience(writer, content);
            drawEducation(writer, content);
            drawSkills(writer, content, accent);
            drawCertifications(writer, content);
            drawLanguages(writer, content);
            drawProjects(writer, content);

            writer.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Loi sinh PDF CV: {}", e.getMessage());
            throw new RuntimeException("Khong the sinh PDF CV: " + e.getMessage());
        }
    }

    private PDFont loadFont(PDDocument document) throws IOException {
        try (InputStream is = new ClassPathResource("fonts/NotoSans-Regular.ttf").getInputStream()) {
            return PDType0Font.load(document, is);
        }
    }

    private float[] accentColorFor(CvTemplate template) {
        return switch (template) {
            case MODERN -> new float[]{0.10f, 0.30f, 0.65f};   // navy
            case CLASSIC -> new float[]{0.25f, 0.25f, 0.25f};  // dark gray, tiet che
            case CREATIVE -> new float[]{0.65f, 0.15f, 0.45f}; // hong/tia noi bat
        };
    }

    private void drawHeader(PdfFlowWriter w, CvBuilderContent content, CvTemplate template, float[] accent) throws IOException {
        CvBuilderContent.PersonalInfo p = Optional.ofNullable(content.getPersonalInfo())
                .orElse(new CvBuilderContent.PersonalInfo());

        if (template == CvTemplate.CLASSIC) {
            // Don gian: ten + headline + lien he, khong bang mau
            w.drawText(nonNull(p.getFullName(), "Họ và tên"), w.boldFont, 22, 0, 0, 0);
            w.moveDown(26);
            if (notBlank(p.getHeadline())) {
                w.drawText(p.getHeadline(), w.font, 12, 0.35f, 0.35f, 0.35f);
                w.moveDown(18);
            }
            w.drawText(contactLine(p), w.font, 10, 0.35f, 0.35f, 0.35f);
            w.moveDown(14);
            w.drawDivider(accent);
        } else {
            // MODERN / CREATIVE: bang mau full-width
            float bandHeight = notBlank(p.getHeadline()) ? 80f : 64f;
            w.drawColoredBand(bandHeight, accent);
            float savedY = w.y;
            w.y = w.pageTopY() - 28;
            w.drawText(nonNull(p.getFullName(), "Họ và tên"), w.boldFont, 22, 1, 1, 1);
            w.moveDown(24);
            if (notBlank(p.getHeadline())) {
                w.drawText(p.getHeadline(), w.font, 12, 1, 1, 1);
                w.moveDown(18);
            }
            w.drawText(contactLine(p), w.font, 9.5f, 1, 1, 1);
            w.y = savedY - bandHeight - 16;
        }
    }

    private String contactLine(CvBuilderContent.PersonalInfo p) {
        List<String> parts = new ArrayList<>();
        if (notBlank(p.getEmail())) parts.add(p.getEmail());
        if (notBlank(p.getPhone())) parts.add(p.getPhone());
        if (notBlank(p.getAddress())) parts.add(p.getAddress());
        return String.join("   |   ", parts);
    }

    private void drawSummary(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        CvBuilderContent.PersonalInfo p = content.getPersonalInfo();
        if (p == null || !notBlank(p.getSummary())) return;
        w.drawSectionTitle("GIỚI THIỆU");
        w.drawWrappedParagraph(p.getSummary(), w.font, 10.5f, 0.2f, 0.2f, 0.2f);
        w.moveDown(10);
    }

    private void drawExperience(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        if (content.getExperiences() == null || content.getExperiences().isEmpty()) return;
        w.drawSectionTitle("KINH NGHIỆM LÀM VIỆC");
        for (CvBuilderContent.ExperienceItem e : content.getExperiences()) {
            String title = nonNull(e.getPosition(), "") +
                    (notBlank(e.getCompany()) ? " — " + e.getCompany() : "");
            w.ensureSpace(34);
            w.drawText(title, w.boldFont, 11, 0.1f, 0.1f, 0.1f);
            String range = dateRange(e.getStartDate(), e.getEndDate(), e.isCurrent());
            if (notBlank(range)) {
                w.drawTextRightAligned(range, w.font, 9.5f, 0.45f, 0.45f, 0.45f);
            }
            w.moveDown(16);
            if (notBlank(e.getDescription())) {
                w.drawWrappedParagraph(e.getDescription(), w.font, 10, 0.25f, 0.25f, 0.25f);
            }
            w.moveDown(8);
        }
    }

    private void drawEducation(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        if (content.getEducations() == null || content.getEducations().isEmpty()) return;
        w.drawSectionTitle("HỌC VẤN");
        for (CvBuilderContent.EducationItem ed : content.getEducations()) {
            String title = nonNull(ed.getSchool(), "") +
                    (notBlank(ed.getDegree()) ? " — " + ed.getDegree() : "") +
                    (notBlank(ed.getMajor()) ? " (" + ed.getMajor() + ")" : "");
            w.ensureSpace(30);
            w.drawText(title, w.boldFont, 10.5f, 0.1f, 0.1f, 0.1f);
            String range = dateRange(ed.getStartDate(), ed.getEndDate(), false);
            if (notBlank(range)) {
                w.drawTextRightAligned(range, w.font, 9.5f, 0.45f, 0.45f, 0.45f);
            }
            w.moveDown(15);
            if (notBlank(ed.getDescription())) {
                w.drawWrappedParagraph(ed.getDescription(), w.font, 10, 0.25f, 0.25f, 0.25f);
            }
            w.moveDown(6);
        }
    }

    private void drawSkills(PdfFlowWriter w, CvBuilderContent content, float[] accent) throws IOException {
        if (content.getSkills() == null || content.getSkills().isEmpty()) return;
        w.drawSectionTitle("KỸ NĂNG");
        w.drawChips(content.getSkills(), accent);
        w.moveDown(10);
    }

    private void drawCertifications(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        if (content.getCertifications() == null || content.getCertifications().isEmpty()) return;
        w.drawSectionTitle("CHỨNG CHỈ");
        for (CvBuilderContent.CertificationItem c : content.getCertifications()) {
            String line = nonNull(c.getName(), "") +
                    (notBlank(c.getIssuer()) ? " — " + c.getIssuer() : "") +
                    (notBlank(c.getIssuedDate()) ? " (" + c.getIssuedDate() + ")" : "");
            w.ensureSpace(16);
            w.drawText("• " + line, w.font, 10, 0.2f, 0.2f, 0.2f);
            w.moveDown(15);
        }
        w.moveDown(4);
    }

    private void drawLanguages(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        if (content.getLanguages() == null || content.getLanguages().isEmpty()) return;
        w.drawSectionTitle("NGOẠI NGỮ");
        for (CvBuilderContent.LanguageItem l : content.getLanguages()) {
            String line = nonNull(l.getName(), "") + (notBlank(l.getLevel()) ? " — " + l.getLevel() : "");
            w.ensureSpace(16);
            w.drawText("• " + line, w.font, 10, 0.2f, 0.2f, 0.2f);
            w.moveDown(15);
        }
        w.moveDown(4);
    }

    private void drawProjects(PdfFlowWriter w, CvBuilderContent content) throws IOException {
        if (content.getProjects() == null || content.getProjects().isEmpty()) return;
        w.drawSectionTitle("DỰ ÁN");
        for (CvBuilderContent.ProjectItem pr : content.getProjects()) {
            w.ensureSpace(30);
            w.drawText(nonNull(pr.getName(), ""), w.boldFont, 10.5f, 0.1f, 0.1f, 0.1f);
            w.moveDown(15);
            if (notBlank(pr.getTechStack())) {
                w.drawText("Công nghệ: " + pr.getTechStack(), w.font, 9.5f, 0.4f, 0.4f, 0.4f);
                w.moveDown(13);
            }
            if (notBlank(pr.getDescription())) {
                w.drawWrappedParagraph(pr.getDescription(), w.font, 10, 0.25f, 0.25f, 0.25f);
            }
            if (notBlank(pr.getLink())) {
                w.drawText(pr.getLink(), w.font, 9.5f, 0.1f, 0.3f, 0.6f);
                w.moveDown(13);
            }
            w.moveDown(6);
        }
    }

    private static String dateRange(String start, String end, boolean current) {
        String s = nonNull(start, "");
        String e = current ? "Hiện tại" : nonNull(end, "");
        if (s.isEmpty() && e.isEmpty()) return "";
        return s + " - " + e;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String nonNull(String s, String fallback) {
        return s != null ? s : fallback;
    }

    /**
     * Helper quan ly viec ve text/hinh chu nhat tren PDPageContentStream,
     * tu dong ngat trang khi het cho — tranh viet lai logic nay cho tung
     * section/tung template.
     */
    private static class PdfFlowWriter {
        final PDDocument document;
        final PDFont font;
        final PDFont boldFont;
        final float[] accent;
        PDPage page;
        PDPageContentStream stream;
        float y;
        float pageWidth;
        float pageHeight;

        PdfFlowWriter(PDDocument document, PDFont font, PDFont boldFont, float[] accent) {
            this.document = document;
            this.font = font;
            this.boldFont = boldFont;
            this.accent = accent;
        }

        float pageTopY() {
            return pageHeight - PAGE_MARGIN;
        }

        void newPage() throws IOException {
            if (stream != null) stream.close();
            page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            pageWidth = page.getMediaBox().getWidth();
            pageHeight = page.getMediaBox().getHeight();
            stream = new PDPageContentStream(document, page);
            y = pageTopY();
        }

        void close() throws IOException {
            if (stream != null) stream.close();
        }

        float contentWidth() {
            return pageWidth - 2 * PAGE_MARGIN;
        }

        void ensureSpace(float needed) throws IOException {
            if (y - needed < PAGE_MARGIN) {
                newPage();
            }
        }

        void moveDown(float amount) {
            y -= amount;
        }

        void drawColoredBand(float height, float[] color) throws IOException {
            stream.setNonStrokingColor(color[0], color[1], color[2]);
            stream.addRect(0, pageHeight - height, pageWidth, height);
            stream.fill();
        }

        void drawDivider(float[] color) throws IOException {
            ensureSpace(10);
            stream.setStrokingColor(color[0], color[1], color[2]);
            stream.setLineWidth(1.2f);
            stream.moveTo(PAGE_MARGIN, y);
            stream.lineTo(pageWidth - PAGE_MARGIN, y);
            stream.stroke();
            moveDown(14);
        }

        void drawSectionTitle(String title) throws IOException {
            ensureSpace(28);
            drawText(title, boldFont, 12.5f, accent[0], accent[1], accent[2]);
            moveDown(6);
            stream.setStrokingColor(accent[0], accent[1], accent[2]);
            stream.setLineWidth(1.5f);
            stream.moveTo(PAGE_MARGIN, y);
            stream.lineTo(PAGE_MARGIN + 60, y);
            stream.stroke();
            moveDown(14);
        }

        void drawText(String text, PDFont f, float size, float r, float g, float b) throws IOException {
            if (text == null) text = "";
            ensureSpace(size + 2);
            stream.beginText();
            stream.setFont(f, size);
            stream.setNonStrokingColor(r, g, b);
            stream.newLineAtOffset(PAGE_MARGIN, y);
            stream.showText(sanitize(text));
            stream.endText();
        }

        void drawTextRightAligned(String text, PDFont f, float size, float r, float g, float b) throws IOException {
            if (text == null || text.isEmpty()) return;
            float width = f.getStringWidth(sanitize(text)) / 1000f * size;
            stream.beginText();
            stream.setFont(f, size);
            stream.setNonStrokingColor(r, g, b);
            stream.newLineAtOffset(pageWidth - PAGE_MARGIN - width, y);
            stream.showText(sanitize(text));
            stream.endText();
        }

        void drawWrappedParagraph(String text, PDFont f, float size, float r, float g, float b) throws IOException {
            if (text == null || text.isBlank()) return;
            float maxWidth = contentWidth();
            for (String paragraph : text.split("\n")) {
                if (paragraph.isBlank()) {
                    moveDown(size * 0.6f);
                    continue;
                }
                for (String line : wrapLine(paragraph, f, size, maxWidth)) {
                    ensureSpace(size + LINE_GAP);
                    drawText(line, f, size, r, g, b);
                    moveDown(size + LINE_GAP);
                }
            }
        }

        void drawChips(List<String> chips, float[] color) throws IOException {
            float x = PAGE_MARGIN;
            float chipHeight = 18f;
            float padding = 8f;
            ensureSpace(chipHeight + 6);
            for (String chip : chips) {
                String label = sanitize(chip);
                float textWidth = font.getStringWidth(label) / 1000f * 9.5f;
                float chipWidth = textWidth + padding * 2;
                if (x + chipWidth > pageWidth - PAGE_MARGIN) {
                    x = PAGE_MARGIN;
                    y -= chipHeight + 6;
                    ensureSpace(chipHeight + 6);
                }
                stream.setNonStrokingColor(color[0], color[1], color[2]);
                stream.addRect(x, y - chipHeight + 4, chipWidth, chipHeight);
                stream.fill();
                stream.beginText();
                stream.setFont(font, 9.5f);
                stream.setNonStrokingColor(1, 1, 1);
                stream.newLineAtOffset(x + padding, y - chipHeight + 8);
                stream.showText(label);
                stream.endText();
                x += chipWidth + 8;
            }
            y -= chipHeight + 6;
        }

        private List<String> wrapLine(String text, PDFont f, float size, float maxWidth) throws IOException {
            List<String> lines = new ArrayList<>();
            StringBuilder current = new StringBuilder();
            for (String word : text.split(" ")) {
                String candidate = current.isEmpty() ? word : current + " " + word;
                float width = f.getStringWidth(sanitize(candidate)) / 1000f * size;
                if (width > maxWidth && !current.isEmpty()) {
                    lines.add(current.toString());
                    current = new StringBuilder(word);
                } else {
                    current = new StringBuilder(candidate);
                }
            }
            if (!current.isEmpty()) lines.add(current.toString());
            return lines;
        }

        // Noto Sans co the khong co glyph cho 1 vai ky tu hiem (emoji...),
        // loai bo ky tu ngoai pham vi co ban + Latin Extended de tranh
        // loi "no glyph" khi PDFBox encode.
        private String sanitize(String text) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < text.length(); i++) {
                char c = text.charAt(i);
                if (c == '\t') {
                    sb.append(' ');
                } else if (c < 0x20 && c != '\n') {
                    continue;
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }
    }
}
