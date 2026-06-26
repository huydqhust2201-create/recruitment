-- Thêm cột link nếu chưa tồn tại (trường hợp bảng do Hibernate tạo thiếu cột này)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(500);
