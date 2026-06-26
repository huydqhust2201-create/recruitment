-- Xóa check constraint do Hibernate tự tạo (chỉ cho phép GENERAL, thiếu các giá trị khác)
-- Flyway quản lý schema, không cần constraint này
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
