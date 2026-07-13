package com.example.be.service.impl;

import com.example.be.dto.response.LlmScoringResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class LlmScoringService {

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4o-mini";

    @Value("${openai.api-key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public LlmScoringResult scoreCvAgainstJob(
            String cvText,
            String jobTitle,
            String jobDescription,
            String jobRequirements,
            String customInstructions) {

        try {
            String systemPrompt = """
                    Bạn là chuyên gia tuyển dụng cao cấp tại Việt Nam. Hãy phân tích mức độ phù hợp của ứng viên với vị trí công việc.
                    Trả về DUY NHẤT một JSON hợp lệ (không có markdown, không có giải thích thêm) với cấu trúc sau:
                    {
                      "skill_score": <số thực 0.0-1.0>,
                      "experience_score": <số thực 0.0-1.0>,
                      "education_score": <số thực 0.0-1.0>,
                      "strengths": "<điểm mạnh nổi bật của ứng viên, viết bằng tiếng Việt, 2-3 câu>",
                      "weaknesses": "<điểm yếu hoặc thiếu sót chính, viết bằng tiếng Việt, 2-3 câu>",
                      "recommendation": "<nhận xét tổng thể và lời khuyên cho nhà tuyển dụng, tiếng Việt, 2-3 câu>",
                      "matched_skills": ["<kỹ năng 1>", "<kỹ năng 2>", ...],
                      "missing_skills": ["<kỹ năng thiếu 1>", "<kỹ năng thiếu 2>", ...],
                      "improvement_suggestions": ["<gợi ý cải thiện 1>", "<gợi ý cải thiện 2>", "<gợi ý cải thiện 3>"]
                    }
                    Lưu ý:
                    - matched_skills: tối đa 6 kỹ năng ứng viên ĐÃ có và phù hợp với yêu cầu
                    - missing_skills: tối đa 5 kỹ năng/kinh nghiệm quan trọng mà ứng viên CHƯA có hoặc chưa đề cập
                    - improvement_suggestions: 3 gợi ý cụ thể giúp ứng viên tăng cơ hội PHÙ HỢP VỚI VỊ TRÍ VÀ NGÀNH NGHỀ NÀY (không đề xuất kỹ năng thuộc ngành khác không liên quan, dùng "bạn")
                    - Tất cả text phải bằng tiếng Việt
                    """;

            String userPrompt = String.format("""
                    VỊ TRÍ: %s

                    MÔ TẢ CÔNG VIỆC:
                    %s

                    YÊU CẦU:
                    %s

                    %s

                    HỒ SƠ ỨNG VIÊN:
                    %s
                    """,
                    jobTitle,
                    nullToEmpty(jobDescription),
                    nullToEmpty(jobRequirements),
                    customInstructions != null && !customInstructions.isBlank()
                            ? "HƯỚNG DẪN THÊM: " + customInstructions : "",
                    nullToEmpty(cvText));

            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "temperature", 0.3,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("LLM scoring error {}: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            int tokensUsed = root.path("usage").path("total_tokens").asInt(0);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            JsonNode scores = objectMapper.readTree(content);

            return LlmScoringResult.builder()
                    .skillScore(scores.path("skill_score").asDouble(0.0))
                    .experienceScore(scores.path("experience_score").asDouble(0.0))
                    .educationScore(scores.path("education_score").asDouble(0.0))
                    .strengths(scores.path("strengths").asText(""))
                    .weaknesses(scores.path("weaknesses").asText(""))
                    .recommendation(scores.path("recommendation").asText(""))
                    .matchedSkills(parseStringList(scores.path("matched_skills")))
                    .missingSkills(parseStringList(scores.path("missing_skills")))
                    .improvementSuggestions(parseStringList(scores.path("improvement_suggestions")))
                    .tokensUsed(tokensUsed)
                    .modelUsed(MODEL)
                    .build();

        } catch (Exception e) {
            log.error("LLM scoring failed: {}", e.getMessage());
            return null;
        }
    }

    /** Gọi OpenAI để generate thư xin việc bằng tiếng Việt */
    public String generateCoverLetter(String cvText, String jobTitle, String companyName,
                                      String jobDescription, String jobRequirements,
                                      String candidateName) {
        try {
            String systemPrompt = """
                    Bạn là chuyên gia viết thư xin việc chuyên nghiệp tại Việt Nam.
                    Hãy viết một thư xin việc hoàn chỉnh bằng tiếng Việt, lịch sự, chuyên nghiệp và thuyết phục.
                    Thư phải:
                    - Có đủ cấu trúc: kính gửi, đoạn mở đầu, thân thư (2-3 đoạn), kết thúc, ký tên
                    - Nêu bật các kỹ năng và kinh nghiệm phù hợp với vị trí
                    - Thể hiện sự nhiệt tình và cam kết với vị trí
                    - Dài khoảng 250-350 từ
                    - Không dùng placeholder như [tên], hãy dùng thông tin thực từ CV
                    Chỉ trả về nội dung thư, không có giải thích thêm.
                    """;

            String userPrompt = String.format("""
                    Viết thư xin việc cho:
                    - Ứng viên: %s
                    - Vị trí: %s
                    - Công ty: %s

                    Mô tả công việc: %s
                    Yêu cầu: %s

                    Thông tin CV ứng viên:
                    %s
                    """,
                    nullToEmpty(candidateName),
                    jobTitle,
                    nullToEmpty(companyName),
                    nullToEmpty(jobDescription),
                    nullToEmpty(jobRequirements),
                    nullToEmpty(cvText));

            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "temperature", 0.7,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("Cover letter generation error {}: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("choices").path(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("Cover letter generation failed: {}", e.getMessage());
            return null;
        }
    }

    /** Gọi OpenAI để parse câu tìm kiếm tự nhiên → bộ filter */
    public Map<String, String> parseNaturalLanguageSearch(String query) {
        try {
            String systemPrompt = """
                    Bạn là hệ thống phân tích tìm kiếm việc làm. Người dùng nhập câu tìm kiếm tự nhiên bằng tiếng Việt.
                    Hãy trích xuất các bộ lọc tìm kiếm và trả về JSON với các key:
                    {
                      "keyword": "<từ khóa vị trí/ngành nghề, để trống nếu không có>",
                      "city": "<thành phố, để trống nếu không có>",
                      "level": "<INTERN|JUNIOR|MID|SENIOR|LEAD|MANAGER hoặc để trống>",
                      "industry": "<CNTT|KINH_DOANH|MARKETING|KE_TOAN|NHAN_SU|CHAM_SOC_KH|XAY_DUNG|GIAO_DUC|Y_TE|LAO_DONG_PT|THIET_KE|VAN_TAI hoặc để trống>",
                      "min_salary": "<số nguyên (VND), để trống nếu không đề cập>",
                      "max_salary": "<số nguyên (VND), để trống nếu không đề cập>",
                      "summary": "<tóm tắt ngắn những gì AI hiểu từ câu tìm kiếm, tiếng Việt>"
                    }
                    Quy tắc:
                    - Nếu người dùng nói "25 triệu" thì min_salary = 25000000
                    - Nếu nói "20-30 triệu" thì min_salary = 20000000, max_salary = 30000000
                    - "senior", "cao cấp", "5 năm+" → SENIOR
                    - "junior", "mới ra trường", "fresher" → JUNIOR
                    - "thực tập" → INTERN
                    - "trưởng nhóm", "lead" → LEAD
                    - "manager", "quản lý" → MANAGER
                    - Chỉ điền industry nếu rõ ràng thuộc ngành đó
                    """;

            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "temperature", 0.1,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", "Câu tìm kiếm: " + query)
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.error("NL search parse error {}: {}", response.statusCode(), response.body());
                return Map.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText();
            JsonNode filters = objectMapper.readTree(content);

            java.util.HashMap<String, String> result = new java.util.HashMap<>();
            filters.fields().forEachRemaining(e -> result.put(e.getKey(), e.getValue().asText("")));
            return result;

        } catch (Exception e) {
            log.error("NL search parse failed: {}", e.getMessage());
            return Map.of();
        }
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> { if (!n.asText("").isBlank()) list.add(n.asText()); });
        }
        return list;
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
