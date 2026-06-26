-- Fix các cột bị thiếu trong notifications (do Hibernate tạo table trước khi Flyway chạy V6)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message  TEXT         NOT NULL DEFAULT '';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type     VARCHAR(30)  NOT NULL DEFAULT 'GENERAL';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read  BOOLEAN      NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title    VARCHAR(255) NOT NULL DEFAULT '';
