package com.example.be.service.impl;

import com.example.be.service.inf.EmbeddingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Slf4j
@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    @Value("${openai.api-key}")
    private String apiKey;

    private static final String OPENAI_URL =
            "https://api.openai.com/v1/embeddings";
    private static final String MODEL =
            "text-embedding-3-small"; // 1536 chiá»u, ráº» nháº¥t ~$0.00002/1K token

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();


    public float[] createEmbedding(String text) {
        try {
            // 1. Chuáº©n bá»‹ request body
            String requestBody = objectMapper.writeValueAsString(
                    Map.of("model", MODEL, "input", text)
            );

            // 2. Build HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // 3. Gá»­i vÃ  nháº­n response
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            // 4. Kiá»ƒm tra status code
            if (response.statusCode() != 200) {
                log.error("OpenAI tráº£ vá» lá»—i {}: {}",
                        response.statusCode(), response.body());
                return null;
            }

            // 5. Parse JSON láº¥y máº£ng embedding
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode embeddingArray = root
                    .path("data").get(0)
                    .path("embedding");

            // 6. Convert JsonNode â†’ float[]
            float[] embedding = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                embedding[i] = (float) embeddingArray.get(i).asDouble();
            }

            log.info("Táº¡o embedding thÃ nh cÃ´ng â€” {} chiá»u", embedding.length);
            return embedding;

        } catch (Exception e) {
            log.error("Lá»—i khi táº¡o embedding: {}", e.getMessage());
            return null; // khÃ´ng throw â€” job váº«n publish Ä‘Æ°á»£c dÃ¹ AI lá»—i
        }
    }

    /**
     * Táº¡o embedding cho JD â€” ghÃ©p title + description + requirements
     */
    public float[] createJobEmbedding(String title,
                                      String description,
                                      String requirements) {
        String fullText = String.format(
                "Job Title: %s\n\nDescription: %s\n\nRequirements: %s",
                title,
                description != null ? description : "",
                requirements != null ? requirements : ""
        );
        return createEmbedding(fullText);
    }
}
