# Recruitment Platform — Hệ thống Tuyển dụng AI

Website tuyển dụng tích hợp AI hỗ trợ gợi ý việc làm, xây dựng CV thông minh và quản lý ứng tuyển.

**Stack**: Next.js 16 (FE) · Spring Boot 3.4.1 / Java 21 (BE) · PostgreSQL + pgvector · MinIO · OpenAI API

---

## Yêu cầu cài đặt
"Để chạy đầy đủ tính năng AI, cần cung cấp OPENAI_API_KEY từ tài khoản cá nhân tại platform.openai.com. Hệ thống vẫn hoạt động bình thường nếu thiếu key này, chỉ vô hiệu hoá các tính năng AI."
| Công cụ | Phiên bản tối thiểu |
|---|---|
| Java JDK | 21 |
| Maven | 3.9+ (hoặc dùng `mvnw` đi kèm) |
| Node.js | 18+ |
| PostgreSQL | 15+ với extension **pgvector** |
| MinIO | Bất kỳ (hoặc dùng Docker) |

---

## 1. Cơ sở dữ liệu (PostgreSQL + pgvector)

### Cài pgvector

```bash
# Ubuntu/Debian
sudo apt install postgresql-16-pgvector

# macOS
brew install pgvector

# Windows: tải từ https://github.com/pgvector/pgvector/releases
```

### Tạo database

```sql
-- Kết nối psql với user postgres
CREATE DATABASE recruitment_db;
\c recruitment_db
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

> Schema sẽ tự động tạo khi khởi động BE lần đầu thông qua Flyway migrations.

---

## 2. MinIO (lưu trữ file CV)

Cách nhanh nhất là chạy bằng Docker:

```bash
docker run -d --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

Sau đó vào [http://localhost:9001](http://localhost:9001), đăng nhập `minioadmin / minioadmin` và tạo bucket tên `recruitment-cv`.

---

## 3. Cấu hình Backend

### Tạo file `.env` (hoặc set biến môi trường)

Tạo file `BE/.env` hoặc export các biến sau trước khi chạy:

```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/recruitment_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_postgres_password

# JWT — tạo chuỗi random bất kỳ, ít nhất 32 ký tự
JWT_SECRET=your_very_long_secret_key_at_least_32_chars

# MinIO
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=recruitment-cv
MINIO_PUBLIC_URL=http://localhost:9000

# OpenAI — cần có API key thật để dùng tính năng AI
OPENAI_API_KEY=sk-...

# Email (tuỳ chọn — cần nếu muốn gửi thông báo qua email)
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# VNPay sandbox (có thể giữ nguyên giá trị mặc định)
VNPAY_TMN_CODE=CGPNBGEI
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSLDIIZTBEIYGHWT
VNPAY_RETURN_URL=http://localhost:3001/recruiter/subscription
```

> **Lưu ý Gmail**: cần bật "App Password" tại [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), không dùng mật khẩu Gmail thông thường.

### Chạy Backend

```bash
cd BE

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

BE khởi động tại [http://localhost:8080](http://localhost:8080).  
Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 4. Cấu hình Frontend

### Tạo file `.env.local`

```bash
# FE/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Chạy Frontend

```bash
cd FE
npm install
npm run dev
```

FE chạy tại [http://localhost:3001](http://localhost:3001).

---

## 5. Seed dữ liệu demo

Sau khi BE đã khởi động thành công (Flyway tạo schema xong), chạy file SQL sau trong psql hoặc công cụ quản lý DB (pgAdmin, DBeaver...):

```bash
psql -U postgres -d recruitment_db -f seed_demo.sql
```

File này tạo sẵn:
- 6 công ty (FPT Software, Shopee, VNG, Tiki, MoMo, Grab)
- 6 tài khoản recruiter + 10 tài khoản ứng viên
- 30 tin tuyển dụng đang ACTIVE

**Mật khẩu tất cả tài khoản demo**: `Demo@123`

| Vai trò | Email mẫu |
|---|---|
| Recruiter | `recruiter.fpt@demo.com`, `recruiter.shopee@demo.com`, ... |
| Ứng viên | `candidate1@demo.com` → `candidate10@demo.com` |

---

## 6. Tạo tài khoản Admin

Chạy SQL sau trong database:

```sql
INSERT INTO users (id, email, password_hash, role, full_name, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@demo.com',
    crypt('Admin@123', gen_salt('bf', 10)),
    'ADMIN',
    'Admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
```

Đăng nhập admin: `admin@demo.com` / `Admin@123`

---

## Tóm tắt URL

| Dịch vụ | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| MinIO Console | http://localhost:9001 |

---

## Cấu trúc thư mục

```
recruitment/
├── BE/                  # Spring Boot backend
│   ├── src/main/java/   # Java source
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/   # Flyway SQL migrations (V1–V14)
│   └── pom.xml
├── FE/                  # Next.js frontend
│   ├── src/app/         # App Router pages
│   ├── src/components/
│   └── package.json
└── seed_demo.sql        # Dữ liệu demo
```

---

## Tính năng chính

- **Ứng viên**: tìm kiếm việc làm, lưu tin, nộp CV, xây dựng CV với 5 template (AI tự điền thông tin), gợi ý việc làm theo hồ sơ
- **Nhà tuyển dụng**: đăng tin, quản lý ứng viên, xem profile ứng viên phù hợp, gói subscription
- **Admin**: quản lý người dùng, công ty, gói dịch vụ
- **AI**: vector embedding so khớp CV ↔ JD (OpenAI `text-embedding-3-small`), tóm tắt ứng viên

> Các tính năng AI chỉ hoạt động khi cung cấp `OPENAI_API_KEY` hợp lệ. Hệ thống vẫn chạy bình thường nếu thiếu key, chỉ tắt phần AI.
