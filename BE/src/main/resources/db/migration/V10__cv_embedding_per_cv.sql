-- Store embedding per CV so switching primary CV updates recommendations
ALTER TABLE cv_parse_results ADD COLUMN IF NOT EXISTS cv_embedding vector(1536);
