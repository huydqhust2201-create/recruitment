-- ── Gói dịch vụ ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    price_monthly   BIGINT       NOT NULL DEFAULT 0,
    max_jobs        INT          NOT NULL DEFAULT 3,
    ai_scoring      BOOLEAN      NOT NULL DEFAULT false,
    ai_recommend    BOOLEAN      NOT NULL DEFAULT false,
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO subscription_plans (code, name, price_monthly, max_jobs, ai_scoring, ai_recommend, description) VALUES
('FREE',  'Miễn phí',         0,        3,  false, false, 'Dành cho nhà tuyển dụng mới bắt đầu. 3 tin đăng/tháng, không có AI.'),
('BASIC', 'Cơ bản',     499000,       15,  true,  false, 'Phù hợp doanh nghiệp vừa. 15 tin/tháng, AI chấm điểm CV tự động.'),
('PRO',   'Chuyên nghiệp', 1299000,   -1,  true,  true,  'Không giới hạn tin đăng, đầy đủ tính năng AI, gợi ý ứng viên.')
ON CONFLICT (code) DO NOTHING;

-- ── Đăng ký gói của công ty ──────────────────────────────────
CREATE TABLE IF NOT EXISTS company_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    jobs_used       INT          NOT NULL DEFAULT 0,
    payment_ref     VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_company_sub_company ON company_subscriptions(company_id, status);

-- ── Thông báo in-app ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    type        VARCHAR(30)  NOT NULL DEFAULT 'GENERAL',
    link        VARCHAR(500),
    is_read     BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
