-- CV Builder: candidate tu tao CV tu form, xuat PDF

CREATE TABLE cv_builder_documents (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id            UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    title                   VARCHAR(255) NOT NULL DEFAULT 'CV của tôi',
    template                VARCHAR(30) NOT NULL DEFAULT 'MODERN',
    content                 JSONB NOT NULL,
    exported_cv_file_id     UUID REFERENCES cv_files(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cv_builder_template CHECK (
        template IN ('MODERN', 'CLASSIC', 'CREATIVE')
    )
);

CREATE INDEX idx_cv_builder_candidate
    ON cv_builder_documents (candidate_id, updated_at DESC);
