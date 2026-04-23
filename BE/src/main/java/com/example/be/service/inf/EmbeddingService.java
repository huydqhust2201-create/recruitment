package com.example.be.service.inf;

public interface EmbeddingService {
     float[] createEmbedding(String text);
     float[] createJobEmbedding(String title,
                                String description, String requirements);
}

