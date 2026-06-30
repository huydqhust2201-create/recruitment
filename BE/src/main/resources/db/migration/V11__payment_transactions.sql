CREATE TABLE payment_transactions (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_ref            VARCHAR(50) NOT NULL UNIQUE,
    company_id         UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_code          VARCHAR(20) NOT NULL,
    amount             BIGINT      NOT NULL,
    status             VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    vnp_transaction_no VARCHAR(50),
    vnp_response_code  VARCHAR(10),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_txn_ref ON payment_transactions(txn_ref);
CREATE INDEX idx_payment_company  ON payment_transactions(company_id);
