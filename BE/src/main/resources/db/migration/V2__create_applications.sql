-- Applications module: apply flow, notes, stage audit trail

CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cv_file_id      UUID NOT NULL REFERENCES cv_files(id) ON DELETE RESTRICT,
    cover_letter    TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    ai_match_score  DOUBLE PRECISION,
    passed_threshold BOOLEAN,
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_applications_job_candidate UNIQUE (job_id, candidate_id),
    CONSTRAINT chk_applications_status CHECK (
        status IN (
            'SUBMITTED', 'REVIEWING', 'SHORTLISTED',
            'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN'
        )
    )
);

CREATE INDEX idx_applications_job_score
    ON applications (job_id, ai_match_score DESC NULLS LAST);

CREATE INDEX idx_applications_candidate
    ON applications (candidate_id, applied_at DESC);

CREATE TABLE application_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    recruiter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_private      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_application_notes_application
    ON application_notes (application_id, created_at DESC);

CREATE TABLE stage_transitions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id      UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    changed_by_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_status         VARCHAR(20),
    to_status           VARCHAR(20) NOT NULL,
    note                TEXT,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stage_transitions_application
    ON stage_transitions (application_id, changed_at DESC);
