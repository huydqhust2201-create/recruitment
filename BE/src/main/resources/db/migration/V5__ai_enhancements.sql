-- Hướng 1: Thêm cột phân tích chi tiết vào ai_score_results
ALTER TABLE ai_score_results
    ADD COLUMN IF NOT EXISTS missing_skills       TEXT,
    ADD COLUMN IF NOT EXISTS matched_skills       TEXT,
    ADD COLUMN IF NOT EXISTS improvement_suggestions TEXT;
