-- Base schema: tất cả bảng cốt lõi được tạo từ đầu (Flyway V1)

-- pgvector extension (cần cho embedding AI)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('CANDIDATE', 'RECRUITER', 'ADMIN')),
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      TEXT,
    is_verified     BOOLEAN      NOT NULL DEFAULT false,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── companies ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    logo_url        TEXT,
    website         VARCHAR(255),
    industry        VARCHAR(100),
    company_size    VARCHAR(20),
    description     TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    is_verified     BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── recruiter_profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recruiter_profiles (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_id  UUID         REFERENCES companies(id) ON DELETE SET NULL,
    position    VARCHAR(255),
    is_verified BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── skills ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── jobs ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID         NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) NOT NULL UNIQUE,
    description      TEXT         NOT NULL,
    requirements     TEXT,
    benefits         TEXT,
    job_type         VARCHAR(20)  NOT NULL CHECK (job_type IN ('FULL_TIME','PART_TIME','REMOTE','HYBRID','INTERNSHIP')),
    level            VARCHAR(20)  NOT NULL CHECK (level IN ('INTERN','JUNIOR','MID','SENIOR','LEAD','MANAGER')),
    industry         VARCHAR(100),
    city             VARCHAR(100),
    salary_min       BIGINT,
    salary_max       BIGINT,
    currency         VARCHAR(10)  NOT NULL DEFAULT 'VND',
    is_salary_public BOOLEAN      NOT NULL DEFAULT true,
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','PAUSED','CLOSED')),
    view_count       INT          NOT NULL DEFAULT 0,
    apply_count      INT          NOT NULL DEFAULT 0,
    jd_embedding     vector(1536),
    deadline         DATE,
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company  ON jobs (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs (recruiter_id);

-- ── job_criteria (1-1 với jobs) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_criteria (
    id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID             NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
    skill_weight        INT              NOT NULL DEFAULT 40,
    experience_weight   INT              NOT NULL DEFAULT 35,
    education_weight    INT              NOT NULL DEFAULT 25,
    pass_threshold      DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    custom_instructions TEXT,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ── job_skills ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_skills (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id      UUID        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id    UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN     NOT NULL DEFAULT true,
    level       VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills (job_id);

-- ── candidate_profiles ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id                   UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID             NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline             VARCHAR(255),
    current_position     VARCHAR(255),
    current_company      VARCHAR(255),
    bio                  TEXT,
    years_of_experience  INT,
    gender               VARCHAR(20)      CHECK (gender IN ('MALE','FEMALE','OTHER')),
    date_of_birth        DATE,
    city                 VARCHAR(100),
    address              VARCHAR(255),
    career_goals         TEXT,
    profile_completeness INT              NOT NULL DEFAULT 0,
    cv_embedding         vector(1536),
    last_active          TIMESTAMPTZ,
    updated_at           TIMESTAMPTZ
);

-- ── cv_files ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_files (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID         NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    file_url     TEXT         NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_type    VARCHAR(10)  NOT NULL,
    file_size_kb INT,
    is_primary   BOOLEAN      NOT NULL DEFAULT false,
    uploaded_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_files_candidate ON cv_files (candidate_id, uploaded_at DESC);
