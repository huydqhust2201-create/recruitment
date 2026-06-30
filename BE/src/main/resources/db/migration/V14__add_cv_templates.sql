ALTER TABLE cv_builder_documents
    DROP CONSTRAINT chk_cv_builder_template;

ALTER TABLE cv_builder_documents
    ADD CONSTRAINT chk_cv_builder_template CHECK (
        template IN ('MODERN', 'CLASSIC', 'CREATIVE', 'PROFESSIONAL', 'MINIMAL')
    );
