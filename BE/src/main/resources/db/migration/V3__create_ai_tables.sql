-- AI pipeline tables: scoring, recommendations, CV parse, usage logs

CREATE TABLE cv_parse_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_file_id          UUID NOT NULL UNIQUE REFERENCES cv_files(id) ON DELETE CASCADE,
    candidate_id        UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    raw_text            TEXT,
    parsed_skills       JSONB,
    parsed_education    JSONB,
    parsed_experience   JSONB,
    parse_confidence    DOUBLE PRECISION,
    ai_model_used       VARCHAR(100),
    parsed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cv_parse_results_candidate ON cv_parse_results (candidate_id);

CREATE TABLE ai_score_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id      UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    vector_score        DOUBLE PRECISION,
    llm_score           DOUBLE PRECISION,
    skill_score         DOUBLE PRECISION,
    experience_score    DOUBLE PRECISION,
    education_score     DOUBLE PRECISION,
    final_score         DOUBLE PRECISION,
    strengths           TEXT,
    weaknesses          TEXT,
    recommendation      TEXT,
    ai_model_used       VARCHAR(100),
    tokens_used         INT,
    scored_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id        UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id              UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    similarity_score    DOUBLE PRECISION NOT NULL,
    is_seen             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_job_recommendations_candidate_job UNIQUE (candidate_id, job_id)
);

CREATE INDEX idx_job_recommendations_candidate ON job_recommendations (candidate_id, similarity_score DESC);

CREATE TABLE ai_usage_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    feature             VARCHAR(50) NOT NULL,
    tokens_input        INT,
    tokens_output       INT,
    cost_usd            DOUBLE PRECISION,
    success             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_logs_user ON ai_usage_logs (user_id, created_at DESC);
