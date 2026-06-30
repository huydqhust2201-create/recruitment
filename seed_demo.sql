-- ═══════════════════════════════════════════════════════════════
-- SEED DATA cho Recruitment App (Demo)
-- Tất cả mật khẩu: Demo@123
-- Chạy trong Neon SQL Console
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  pw           TEXT;
  plan_free    UUID; plan_basic UUID; plan_pro UUID;
  c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID; c6 UUID;
  r1 UUID; r2 UUID; r3 UUID; r4 UUID; r5 UUID; r6 UUID;
  ca1 UUID; ca2 UUID; ca3 UUID; ca4 UUID; ca5 UUID;
  ca6 UUID; ca7 UUID; ca8 UUID; ca9 UUID; ca10 UUID;
BEGIN
  pw := crypt('Demo@123', gen_salt('bf', 10));
  SELECT id INTO plan_free  FROM subscription_plans WHERE code = 'FREE';
  SELECT id INTO plan_basic FROM subscription_plans WHERE code = 'BASIC';
  SELECT id INTO plan_pro   FROM subscription_plans WHERE code = 'PRO';

  -- ── COMPANIES ──────────────────────────────────────────────────
  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('FPT Software', 'fpt-software', 'https://fsoft.com.vn', 'CNTT', '500_PLUS',
    'FPT Software là đơn vị dịch vụ CNTT toàn cầu hàng đầu Việt Nam với hơn 25.000 nhân sự, phục vụ 1.000+ khách hàng tại 30+ quốc gia.',
    'Hà Nội', true, 'https://logo.clearbit.com/fpt.com.vn')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c1;

  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('Shopee Vietnam', 'shopee-vietnam', 'https://shopee.vn', 'CNTT', '500_PLUS',
    'Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á, kết nối hàng triệu người mua và người bán.',
    'Hồ Chí Minh', true, 'https://logo.clearbit.com/shopee.vn')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c2;

  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('VNG Corporation', 'vng-corporation', 'https://vng.com.vn', 'CNTT', '500_PLUS',
    'VNG là công ty công nghệ hàng đầu Việt Nam, nổi tiếng với Zalo, ZaloPay và các game online.',
    'Hồ Chí Minh', true, 'https://logo.clearbit.com/vng.com.vn')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c3;

  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('Tiki Corporation', 'tiki-corporation', 'https://tiki.vn', 'CNTT', '500_PLUS',
    'Tiki là sàn thương mại điện tử thuần Việt, nổi tiếng với chất lượng hàng hoá và dịch vụ giao hàng nhanh TikiNOW.',
    'Hồ Chí Minh', true, 'https://logo.clearbit.com/tiki.vn')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c4;

  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('MoMo (M_Service)', 'momo-mservice', 'https://momo.vn', 'TAI_CHINH', '500_PLUS',
    'MoMo là ví điện tử số 1 Việt Nam với 30+ triệu người dùng, cung cấp dịch vụ thanh toán điện tử toàn diện.',
    'Hồ Chí Minh', true, 'https://logo.clearbit.com/momo.vn')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c5;

  INSERT INTO companies (name, slug, website, industry, company_size, description, city, is_verified, logo_url)
  VALUES ('Grab Vietnam', 'grab-vietnam', 'https://grab.com/vn', 'CNTT', '201_500',
    'Grab là siêu ứng dụng hàng đầu Đông Nam Á, cung cấp dịch vụ vận chuyển, giao đồ ăn và thanh toán.',
    'Hồ Chí Minh', true, 'https://logo.clearbit.com/grab.com')
  ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO c6;

  -- ── RECRUITER USERS ────────────────────────────────────────────
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.fpt@demo.com', pw, 'RECRUITER', 'Nguyễn Thanh Hà', '0912345601', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r1;

  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.shopee@demo.com', pw, 'RECRUITER', 'Trần Minh Khoa', '0912345602', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r2;

  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.vng@demo.com', pw, 'RECRUITER', 'Lê Thu Trang', '0912345603', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r3;

  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.tiki@demo.com', pw, 'RECRUITER', 'Phạm Anh Dũng', '0912345604', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r4;

  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.momo@demo.com', pw, 'RECRUITER', 'Hoàng Thanh Vân', '0912345605', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r5;

  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('recruiter.grab@demo.com', pw, 'RECRUITER', 'Vũ Quốc Hùng', '0912345606', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id INTO r6;

  -- ── RECRUITER PROFILES ─────────────────────────────────────────
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r1, c1, 'HR Manager', true) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r2, c2, 'Talent Acquisition Lead', true) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r3, c3, 'HR Specialist', true) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r4, c4, 'People & Culture Manager', true) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r5, c5, 'Talent Manager', true) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO recruiter_profiles (user_id, company_id, position, is_verified)
  VALUES (r6, c6, 'HR Business Partner', true) ON CONFLICT (user_id) DO NOTHING;

  -- ── COMPANY SUBSCRIPTIONS ──────────────────────────────────────
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c1, plan_pro, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c1);
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c2, plan_pro, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c2);
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c3, plan_basic, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c3);
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c4, plan_basic, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c4);
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c5, plan_pro, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c5);
  INSERT INTO company_subscriptions (company_id, plan_id, status, expires_at, jobs_used)
  SELECT c6, plan_basic, 'ACTIVE', NOW() + INTERVAL '1 year', 0
  WHERE NOT EXISTS (SELECT 1 FROM company_subscriptions WHERE company_id = c6);

  -- ── CANDIDATE USERS ────────────────────────────────────────────
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate1@demo.com', pw, 'CANDIDATE', 'Nguyễn Minh Tuấn', '0901234501', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca1;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate2@demo.com', pw, 'CANDIDATE', 'Trần Thị Mai', '0901234502', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca2;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate3@demo.com', pw, 'CANDIDATE', 'Lê Hoàng Nam', '0901234503', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca3;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate4@demo.com', pw, 'CANDIDATE', 'Phạm Thùy Linh', '0901234504', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca4;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate5@demo.com', pw, 'CANDIDATE', 'Hoàng Văn Bình', '0901234505', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca5;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate6@demo.com', pw, 'CANDIDATE', 'Đỗ Thị Kim Anh', '0901234506', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca6;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate7@demo.com', pw, 'CANDIDATE', 'Vũ Đức Thắng', '0901234507', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca7;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate8@demo.com', pw, 'CANDIDATE', 'Ngô Thị Hương', '0901234508', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca8;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate9@demo.com', pw, 'CANDIDATE', 'Bùi Quang Hải', '0901234509', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca9;
  INSERT INTO users (email, password_hash, role, full_name, phone, is_verified, is_active)
  VALUES ('candidate10@demo.com', pw, 'CANDIDATE', 'Dương Thị Lan', '0901234510', true, true)
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id INTO ca10;

  -- ── CANDIDATE PROFILES ─────────────────────────────────────────
  INSERT INTO candidate_profiles (user_id, headline, current_position, current_company, bio, years_of_experience, city, gender)
  VALUES
  (ca1, 'Senior Java Developer | 5 năm kinh nghiệm', 'Java Developer', 'CMC Technology',
   'Kỹ sư phần mềm với 5 năm kinh nghiệm backend Java/Spring Boot. Đam mê thiết kế hệ thống phân tán và microservices.', 5, 'Hà Nội', 'MALE'),
  (ca2, 'Frontend Developer | React & TypeScript', 'Frontend Developer', 'Freelance',
   'Frontend developer với 3 năm kinh nghiệm React, TypeScript. Yêu thích tạo ra UI đẹp và trải nghiệm người dùng mượt mà.', 3, 'Hồ Chí Minh', 'FEMALE'),
  (ca3, 'Full Stack Developer | 4 năm kinh nghiệm', 'Software Engineer', 'VietSoftware',
   'Full stack developer React + Node.js với 4 năm kinh nghiệm. Thích xây dựng sản phẩm từ đầu đến cuối.', 4, 'Đà Nẵng', 'MALE'),
  (ca4, 'Data Engineer | Python & Spark', 'Data Engineer', 'Analytics Corp',
   'Data engineer với 3 năm kinh nghiệm xây dựng data pipeline, ETL với Python, Spark, Airflow.', 3, 'Hồ Chí Minh', 'FEMALE'),
  (ca5, 'DevOps Engineer | AWS & Kubernetes', 'DevOps Engineer', 'CloudTech VN',
   'DevOps engineer với 4 năm kinh nghiệm AWS, GCP, Kubernetes, Terraform. Đam mê tự động hóa và Infrastructure as Code.', 4, 'Hà Nội', 'MALE'),
  (ca6, 'Mobile Developer | React Native & Flutter', 'Mobile Developer', 'AppMaker',
   'Mobile developer với 2 năm kinh nghiệm React Native và Flutter. Đã publish 5+ app lên AppStore và PlayStore.', 2, 'Hồ Chí Minh', 'FEMALE'),
  (ca7, 'Backend Developer | Go & Microservices', 'Software Engineer', 'FinTech Company',
   'Backend developer yêu thích Go và kiến trúc microservices. 3 năm kinh nghiệm hệ thống high-traffic.', 3, 'Hà Nội', 'MALE'),
  (ca8, 'Business Analyst | Banking Domain', 'Senior BA', 'TPBank',
   'BA với 5 năm kinh nghiệm phân tích nghiệp vụ ngân hàng. Thành thạo BPMN, UML, SQL.', 5, 'Hà Nội', 'FEMALE'),
  (ca9, 'AI/ML Engineer | Deep Learning', 'ML Engineer', 'AI Startup',
   'ML engineer với 2 năm kinh nghiệm deep learning, computer vision. Sử dụng PyTorch, TensorFlow, Hugging Face.', 2, 'Hồ Chí Minh', 'MALE'),
  (ca10, 'QA Engineer | Automation Testing', 'QA Lead', 'Rikkeisoft',
   'QA engineer với 4 năm kinh nghiệm automation testing Selenium, Cypress, JMeter. ISTQB certified.', 4, 'Hà Nội', 'FEMALE')
  ON CONFLICT (user_id) DO NOTHING;

  -- ── JOBS: FPT Software ─────────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c1, r1, 'Senior Java Developer', 'fpt-senior-java-dev-001',
   'Tham gia phát triển hệ thống backend cho khách hàng Nhật Bản và Mỹ trong môi trường Agile/Scrum.',
   '- 3+ năm Java 11+, Spring Boot' || E'\n' || '- Thành thạo Hibernate/JPA, RESTful API' || E'\n' || '- Kinh nghiệm PostgreSQL/MySQL' || E'\n' || '- Tiếng Anh TOEIC 700+',
   '- Lương 28-45 triệu, review 2 lần/năm' || E'\n' || '- Bảo hiểm sức khoẻ Bảo Minh' || E'\n' || '- Đào tạo chứng chỉ quốc tế' || E'\n' || '- WFH 2 ngày/tuần',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hà Nội', 28000000, 45000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c1, r1, 'React Frontend Developer', 'fpt-react-frontend-001',
   'Xây dựng giao diện web cho các dự án SaaS phục vụ thị trường quốc tế.',
   '- 2+ năm React, TypeScript' || E'\n' || '- Thành thạo HTML/CSS, responsive design' || E'\n' || '- Kinh nghiệm REST API integration',
   '- Lương 18-28 triệu' || E'\n' || '- Review lương hàng năm' || E'\n' || '- Teambuilding, hoạt động ngoại khoá' || E'\n' || '- Môi trường quốc tế',
   'FULL_TIME', 'MID', 'CNTT', 'Hà Nội', 18000000, 28000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c1, r1, 'QA Automation Engineer', 'fpt-qa-automation-001',
   'Viết và maintain automation test scripts cho các dự án Java và web.',
   '- 2+ năm automation testing' || E'\n' || '- Thành thạo Selenium/Cypress hoặc Appium' || E'\n' || '- Biết SQL, API testing (Postman)',
   '- Lộ trình thăng tiến rõ ràng' || E'\n' || '- Đào tạo kỹ năng' || E'\n' || '- 13 tháng lương/năm',
   'FULL_TIME', 'MID', 'CNTT', 'Hà Nội', 15000000, 22000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),

  (c1, r1, 'DevOps Engineer', 'fpt-devops-engineer-001',
   'Xây dựng CI/CD pipeline, quản lý infrastructure AWS cho 20+ dự án.',
   '- 3+ năm DevOps/SRE' || E'\n' || '- Thành thạo Docker, Kubernetes' || E'\n' || '- AWS hoặc Azure certification là lợi thế' || E'\n' || '- Kinh nghiệm Terraform',
   '- Lương 30-50 triệu' || E'\n' || '- Hỗ trợ thi chứng chỉ AWS' || E'\n' || '- WFH linh hoạt',
   'HYBRID', 'SENIOR', 'CNTT', 'Hà Nội', 30000000, 50000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c1, r1, 'Business Analyst (Nhật ngữ)', 'fpt-ba-japanese-001',
   'Phân tích nghiệp vụ, làm việc trực tiếp với khách hàng Nhật Bản để thu thập yêu cầu.',
   '- JLPT N2 trở lên' || E'\n' || '- 1+ năm làm BA' || E'\n' || '- Kỹ năng viết tài liệu spec' || E'\n' || '- Biết UML, use case diagram',
   '- Trợ cấp tiếng Nhật hàng tháng' || E'\n' || '- Cơ hội làm việc tại Nhật' || E'\n' || '- Phụ cấp ăn trưa',
   'FULL_TIME', 'JUNIOR', 'CNTT', 'Hà Nội', 12000000, 20000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days')
  ON CONFLICT (slug) DO NOTHING;

  -- ── JOBS: Shopee Vietnam ───────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c2, r2, 'Backend Engineer (Go)', 'shopee-backend-go-001',
   'Phát triển và tối ưu các microservices xử lý hàng triệu đơn hàng mỗi ngày.',
   '- 3+ năm backend development' || E'\n' || '- Thành thạo Go hoặc Java' || E'\n' || '- Kinh nghiệm microservices, gRPC' || E'\n' || '- Hiểu biết về Redis, Kafka',
   '- Lương cực kỳ cạnh tranh' || E'\n' || '- Stock option' || E'\n' || '- Bảo hiểm sức khoẻ cao cấp' || E'\n' || '- Flexible working hours',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 35000000, 60000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c2, r2, 'Data Scientist', 'shopee-data-scientist-001',
   'Xây dựng model ML để tối ưu hệ thống gợi ý sản phẩm và phòng chống gian lận.',
   '- 2+ năm Data Science / ML' || E'\n' || '- Thành thạo Python, scikit-learn, TensorFlow' || E'\n' || '- Kinh nghiệm big data (Spark)' || E'\n' || '- Bằng CNTT hoặc Toán/Thống kê',
   '- Dữ liệu scale lớn' || E'\n' || '- Mentoring từ tech lead' || E'\n' || '- Annual bonus',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 25000000, 45000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c2, r2, 'Frontend Engineer (React)', 'shopee-frontend-react-001',
   'Xây dựng và cải tiến UI/UX cho web Shopee với hàng triệu người dùng đồng thời.',
   '- 2+ năm React' || E'\n' || '- Hiểu về web performance' || E'\n' || '- TypeScript, testing (Jest) là lợi thế',
   '- Flexible remote work' || E'\n' || '- Thiết bị làm việc cao cấp' || E'\n' || '- Budget học tập hàng năm',
   'HYBRID', 'MID', 'CNTT', 'Hồ Chí Minh', 22000000, 38000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),

  (c2, r2, 'Product Manager - Logistics', 'shopee-pm-logistics-001',
   'Dẫn dắt roadmap sản phẩm cho hệ thống logistics và giao vận của Shopee.',
   '- 3+ năm Product Management' || E'\n' || '- Hiểu biết logistics/supply chain' || E'\n' || '- Data-driven, phân tích metrics tốt' || E'\n' || '- Tiếng Anh lưu loát',
   '- Làm việc với team quốc tế' || E'\n' || '- Lương + bonus' || E'\n' || '- Stock option',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 40000000, 70000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c2, r2, 'SRE / Platform Engineer', 'shopee-sre-platform-001',
   'Đảm bảo độ tin cậy hạ tầng Shopee với 99.99% uptime.',
   '- 3+ năm SRE hoặc Platform Engineering' || E'\n' || '- Thành thạo Kubernetes, Helm' || E'\n' || '- Kinh nghiệm observability (Prometheus, Grafana)',
   '- On-call allowance' || E'\n' || '- Scale thật sự' || E'\n' || '- Team building',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 32000000, 55000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days')
  ON CONFLICT (slug) DO NOTHING;

  -- ── JOBS: VNG Corporation ──────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c3, r3, 'Game Developer (Unity)', 'vng-unity-game-dev-001',
   'Phát triển tính năng mới cho game mobile hàng triệu người chơi tại VN và Đông Nam Á.',
   '- 2+ năm Unity C#' || E'\n' || '- Hiểu biết về game optimization' || E'\n' || '- Kinh nghiệm phát triển mobile game',
   '- Làm việc với sản phẩm game nổi tiếng' || E'\n' || '- Môi trường sáng tạo, trẻ trung' || E'\n' || '- Phòng chơi game',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 20000000, 35000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c3, r3, 'Backend Engineer (Java/Go) - Zalo', 'vng-backend-java-go-001',
   'Phát triển các dịch vụ backend cho Zalo với hàng chục triệu người dùng hoạt động mỗi ngày.',
   '- 3+ năm Java hoặc Golang' || E'\n' || '- Kinh nghiệm high-performance systems' || E'\n' || '- Thành thạo SQL và NoSQL',
   '- Thách thức kỹ thuật thực sự' || E'\n' || '- Làm việc với Zalo scale' || E'\n' || '- Chế độ đãi ngộ tốt',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 30000000, 50000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c3, r3, 'iOS Developer (Swift)', 'vng-ios-swift-dev-001',
   'Phát triển và cải tiến ứng dụng Zalo iOS cho hàng chục triệu người dùng.',
   '- 2+ năm iOS (Swift)' || E'\n' || '- Thành thạo UIKit hoặc SwiftUI' || E'\n' || '- Kinh nghiệm publish app AppStore',
   '- Sản phẩm có tác động lớn' || E'\n' || '- MacBook Pro' || E'\n' || '- Lương thỏa thuận',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 22000000, 40000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c3, r3, 'Security Engineer', 'vng-security-engineer-001',
   'Bảo vệ hệ thống Zalo và các sản phẩm VNG trước các mối đe dọa an ninh mạng.',
   '- 2+ năm application security' || E'\n' || '- Kinh nghiệm penetration testing' || E'\n' || '- Thành thạo OWASP Top 10',
   '- Hệ thống quy mô lớn' || E'\n' || '- Tham gia Bug Bounty' || E'\n' || '- Hỗ trợ thi chứng chỉ bảo mật',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 30000000, 55000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c3, r3, 'Intern Software Engineer', 'vng-intern-software-001',
   'Chương trình thực tập 3-6 tháng cho sinh viên năm 3-4, tham gia vào các dự án thực tế tại VNG.',
   '- Sinh viên năm 3-4 CNTT' || E'\n' || '- Biết ít nhất 1 ngôn ngữ lập trình' || E'\n' || '- Ham học hỏi, GPA 7.0+',
   '- Phụ cấp 5-8 triệu/tháng' || E'\n' || '- Mentoring từ senior dev' || E'\n' || '- Cơ hội được nhận chính thức',
   'INTERNSHIP', 'INTERN', 'CNTT', 'Hồ Chí Minh', 5000000, 8000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (slug) DO NOTHING;

  -- ── JOBS: Tiki Corporation ─────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c4, r4, 'Senior Frontend Developer (React/Next.js)', 'tiki-senior-frontend-001',
   'Xây dựng và tối ưu trải nghiệm mua sắm cho hàng triệu người dùng Tiki mỗi ngày.',
   '- 4+ năm React, TypeScript' || E'\n' || '- Thành thạo Next.js, SSR/SSG' || E'\n' || '- Hiểu Core Web Vitals' || E'\n' || '- Kinh nghiệm design system',
   '- Lương 30-50 triệu' || E'\n' || '- WFH 3 ngày/tuần' || E'\n' || '- Discount mua hàng Tiki' || E'\n' || '- Bảo hiểm gia đình',
   'HYBRID', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 30000000, 50000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c4, r4, 'Data Engineer', 'tiki-data-engineer-001',
   'Xây dựng data platform để phân tích hành vi mua hàng và tối ưu vận hành Tiki.',
   '- 2+ năm Data Engineering' || E'\n' || '- Thành thạo Python, SQL' || E'\n' || '- Kinh nghiệm Apache Spark, Airflow' || E'\n' || '- Biết data warehouse',
   '- Dữ liệu thực tế scale lớn' || E'\n' || '- Công nghệ hiện đại' || E'\n' || '- Lương + stock',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 22000000, 38000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c4, r4, 'Android Developer (Kotlin)', 'tiki-android-kotlin-001',
   'Phát triển ứng dụng Android Tiki với hàng triệu MAU, tập trung vào trải nghiệm và hiệu năng.',
   '- 3+ năm Android (Kotlin)' || E'\n' || '- Thành thạo Jetpack Compose' || E'\n' || '- Kinh nghiệm Clean Architecture',
   '- Flex time' || E'\n' || '- Review lương 2 lần/năm' || E'\n' || '- MacBook',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 28000000, 48000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c4, r4, 'UX/UI Designer', 'tiki-ux-ui-designer-001',
   'Thiết kế trải nghiệm người dùng cho web và app Tiki, phối hợp chặt chẽ với PM và Engineering.',
   '- 3+ năm UX/UI Design' || E'\n' || '- Thành thạo Figma' || E'\n' || '- Có portfolio mạnh' || E'\n' || '- Hiểu biết về user research',
   '- Creative environment' || E'\n' || '- Tác động đến triệu user' || E'\n' || '- Figma Enterprise',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 18000000, 32000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),

  (c4, r4, 'Cloud Infrastructure Engineer', 'tiki-cloud-infra-001',
   'Thiết kế và vận hành hạ tầng cloud cho Tiki, đảm bảo hiệu năng và chi phí tối ưu.',
   '- 3+ năm Cloud (AWS/GCP)' || E'\n' || '- Thành thạo Kubernetes, Terraform' || E'\n' || '- Kinh nghiệm cost optimization',
   '- Lương 35-60 triệu' || E'\n' || '- Budget học tập' || E'\n' || '- Chứng chỉ cloud được hỗ trợ',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 35000000, 60000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days')
  ON CONFLICT (slug) DO NOTHING;

  -- ── JOBS: MoMo ─────────────────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c5, r5, 'Senior Backend Engineer (Java)', 'momo-backend-java-001',
   'Phát triển core banking services cho ví MoMo xử lý hàng chục triệu giao dịch mỗi ngày.',
   '- 4+ năm Java, Spring Boot' || E'\n' || '- Kinh nghiệm fintech/banking' || E'\n' || '- Hiểu về transaction, ACID' || E'\n' || '- Thành thạo Redis',
   '- Lương top-of-market' || E'\n' || '- Cổ phần công ty' || E'\n' || '- Bảo hiểm Prudential' || E'\n' || '- Annual overseas trip',
   'FULL_TIME', 'SENIOR', 'TAI_CHINH', 'Hồ Chí Minh', 38000000, 65000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c5, r5, 'Flutter Mobile Developer', 'momo-flutter-mobile-001',
   'Phát triển ứng dụng MoMo trên Flutter cho cả iOS và Android.',
   '- 2+ năm Flutter/Dart' || E'\n' || '- Kinh nghiệm state management (Bloc, Riverpod)' || E'\n' || '- Đã publish app trên store',
   '- Sản phẩm 30M+ users' || E'\n' || '- Thiết bị test đầy đủ' || E'\n' || '- Startup equity',
   'FULL_TIME', 'MID', 'TAI_CHINH', 'Hồ Chí Minh', 22000000, 40000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c5, r5, 'Data Analyst - Risk & Fraud', 'momo-data-analyst-risk-001',
   'Phân tích dữ liệu giao dịch để phát hiện gian lận và quản lý rủi ro cho MoMo.',
   '- 2+ năm Data Analysis' || E'\n' || '- Thành thạo SQL, Python' || E'\n' || '- Hiểu biết về risk management',
   '- Domain fintech thú vị' || E'\n' || '- Dữ liệu giao dịch thực tế' || E'\n' || '- Môi trường professional',
   'FULL_TIME', 'MID', 'TAI_CHINH', 'Hồ Chí Minh', 18000000, 32000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),

  (c5, r5, 'Cybersecurity Analyst', 'momo-cybersecurity-001',
   'Bảo vệ hệ thống thanh toán MoMo, đảm bảo an toàn cho hàng chục triệu giao dịch mỗi ngày.',
   '- 3+ năm Cybersecurity' || E'\n' || '- Kinh nghiệm SIEM, SOC' || E'\n' || '- Hiểu PCI-DSS, ISO 27001',
   '- Compliance exposure' || E'\n' || '- Lương hấp dẫn' || E'\n' || '- Chứng chỉ được tài trợ',
   'FULL_TIME', 'SENIOR', 'TAI_CHINH', 'Hồ Chí Minh', 30000000, 55000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c5, r5, 'Technical Product Manager', 'momo-technical-pm-001',
   'Dẫn dắt roadmap sản phẩm payment infrastructure và API platform của MoMo.',
   '- 4+ năm Product Management' || E'\n' || '- Hiểu sâu về API, system design' || E'\n' || '- Kinh nghiệm fintech',
   '- Impact lớn trong fintech' || E'\n' || '- Equity package' || E'\n' || '- Lương top thị trường',
   'FULL_TIME', 'LEAD', 'TAI_CHINH', 'Hồ Chí Minh', 50000000, 85000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days')
  ON CONFLICT (slug) DO NOTHING;

  -- ── JOBS: Grab Vietnam ─────────────────────────────────────────
  INSERT INTO jobs (company_id, recruiter_id, title, slug, description, requirements, benefits, job_type, level, industry, city, salary_min, salary_max, currency, is_salary_public, status, published_at, deadline)
  VALUES
  (c6, r6, 'Software Engineer - Maps & Navigation', 'grab-maps-navigation-001',
   'Phát triển hệ thống navigation và routing cho GrabMaps phục vụ hàng triệu chuyến đi mỗi ngày.',
   '- 3+ năm Software Engineering' || E'\n' || '- Kinh nghiệm geospatial data là lợi thế' || E'\n' || '- Thành thạo Python hoặc Java',
   '- Công nghệ maps độc đáo' || E'\n' || '- Team quốc tế' || E'\n' || '- Flexible work',
   'HYBRID', 'MID', 'CNTT', 'Hồ Chí Minh', 28000000, 50000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '45 days'),

  (c6, r6, 'Machine Learning Engineer', 'grab-ml-engineer-001',
   'Xây dựng và deploy ML models cho demand prediction, pricing optimization và driver matching.',
   '- 2+ năm ML Engineering' || E'\n' || '- Thành thạo Python, TensorFlow/PyTorch' || E'\n' || '- Kinh nghiệm MLOps',
   '- Real-world ML at scale' || E'\n' || '- Paper publication support' || E'\n' || '- Conference budget',
   'FULL_TIME', 'SENIOR', 'CNTT', 'Hồ Chí Minh', 35000000, 60000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c6, r6, 'Frontend Engineer (React Native)', 'grab-react-native-001',
   'Phát triển tính năng mới cho Grab Super App với hàng chục triệu người dùng ở SEA.',
   '- 2+ năm React Native' || E'\n' || '- Kinh nghiệm performance optimization' || E'\n' || '- TypeScript, Jest',
   '- Siêu ứng dụng SEA' || E'\n' || '- Team đa quốc gia' || E'\n' || '- Salary + RSU',
   'FULL_TIME', 'MID', 'CNTT', 'Hồ Chí Minh', 25000000, 45000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),

  (c6, r6, 'Platform Engineering Lead', 'grab-platform-lead-001',
   'Dẫn dắt team xây dựng developer platform nội bộ cho 3000+ engineers của Grab.',
   '- 6+ năm Engineering, 2+ năm leadership' || E'\n' || '- Kinh nghiệm building internal platforms' || E'\n' || '- Thành thạo Kubernetes, cloud',
   '- Tác động đến toàn engineering org' || E'\n' || '- Lương + equity' || E'\n' || '- Vị trí cấp lead',
   'FULL_TIME', 'LEAD', 'CNTT', 'Hồ Chí Minh', 60000000, 100000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '60 days'),

  (c6, r6, 'Intern - Software Engineer', 'grab-intern-software-001',
   'Chương trình thực tập Grab tại HCM, tham gia dự án thực tế với mentor là senior engineer.',
   '- Sinh viên năm cuối hoặc vừa tốt nghiệp' || E'\n' || '- Thành thạo ít nhất 1 ngôn ngữ lập trình' || E'\n' || '- Tiếng Anh tốt',
   '- Phụ cấp 7-10 triệu/tháng' || E'\n' || '- Mentor 1-1' || E'\n' || '- Cơ hội nhận việc chính thức',
   'INTERNSHIP', 'INTERN', 'CNTT', 'Hồ Chí Minh', 7000000, 10000000, 'VND', true, 'ACTIVE', NOW(), NOW() + INTERVAL '30 days')
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE 'DO block completed: % companies, recruiters, candidates, jobs inserted.', 6;
END $$;

-- ── SKILLS ─────────────────────────────────────────────────────────
INSERT INTO skills (name, category) VALUES
  ('Java', 'Backend'), ('Spring Boot', 'Backend'), ('Go', 'Backend'),
  ('Node.js', 'Backend'), ('Python', 'Backend'),
  ('React', 'Frontend'), ('TypeScript', 'Frontend'), ('Vue.js', 'Frontend'),
  ('Next.js', 'Frontend'), ('Angular', 'Frontend'),
  ('React Native', 'Mobile'), ('Flutter', 'Mobile'),
  ('Swift', 'Mobile'), ('Kotlin', 'Mobile'),
  ('PostgreSQL', 'Database'), ('MySQL', 'Database'),
  ('Redis', 'Database'), ('MongoDB', 'Database'),
  ('Docker', 'DevOps'), ('Kubernetes', 'DevOps'),
  ('AWS', 'Cloud'), ('GCP', 'Cloud'), ('Terraform', 'DevOps'),
  ('Git', 'Tools'), ('Machine Learning', 'AI/ML'),
  ('TensorFlow', 'AI/ML'), ('PyTorch', 'AI/ML'),
  ('Apache Spark', 'Data'), ('Kafka', 'Data'),
  ('Unity', 'Game Dev'), ('Selenium', 'Testing'), ('Figma', 'Design')
ON CONFLICT (name) DO NOTHING;

-- ── JOB SKILLS ─────────────────────────────────────────────────────
INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'fpt-senior-java-dev-001' AND s.name IN ('Java','Spring Boot','PostgreSQL')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'fpt-react-frontend-001' AND s.name IN ('React','TypeScript')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'fpt-devops-engineer-001' AND s.name IN ('Docker','Kubernetes','Terraform','AWS')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'shopee-backend-go-001' AND s.name IN ('Go','Redis','Kafka')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'shopee-data-scientist-001' AND s.name IN ('Python','Machine Learning','Apache Spark')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'shopee-frontend-react-001' AND s.name IN ('React','TypeScript','Next.js')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'shopee-sre-platform-001' AND s.name IN ('Kubernetes','Docker','GCP')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'vng-unity-game-dev-001' AND s.name IN ('Unity','Git')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'vng-backend-java-go-001' AND s.name IN ('Java','Go','Redis','Kafka')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'vng-ios-swift-dev-001' AND s.name IN ('Swift')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'tiki-senior-frontend-001' AND s.name IN ('React','TypeScript','Next.js')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'tiki-data-engineer-001' AND s.name IN ('Python','Apache Spark','PostgreSQL')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'tiki-android-kotlin-001' AND s.name IN ('Kotlin')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'tiki-cloud-infra-001' AND s.name IN ('AWS','Kubernetes','Terraform')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'tiki-ux-ui-designer-001' AND s.name IN ('Figma')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'momo-backend-java-001' AND s.name IN ('Java','Spring Boot','Redis','PostgreSQL')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'momo-flutter-mobile-001' AND s.name IN ('Flutter')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'momo-data-analyst-risk-001' AND s.name IN ('Python','PostgreSQL')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'grab-ml-engineer-001' AND s.name IN ('Python','TensorFlow','PyTorch')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'grab-react-native-001' AND s.name IN ('React Native','TypeScript')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'grab-platform-lead-001' AND s.name IN ('Kubernetes','AWS','Terraform','Docker')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

INSERT INTO job_skills (job_id, skill_id, is_required)
SELECT j.id, s.id, true FROM jobs j, skills s
WHERE j.slug = 'grab-maps-navigation-001' AND s.name IN ('Python','Java','PostgreSQL')
  AND NOT EXISTS (SELECT 1 FROM job_skills x WHERE x.job_id = j.id AND x.skill_id = s.id);

-- ── VERIFY ─────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM companies)            AS companies,
  (SELECT COUNT(*) FROM users WHERE role = 'RECRUITER') AS recruiters,
  (SELECT COUNT(*) FROM users WHERE role = 'CANDIDATE') AS candidates,
  (SELECT COUNT(*) FROM jobs WHERE status = 'ACTIVE')   AS active_jobs,
  (SELECT COUNT(*) FROM skills)               AS skills,
  (SELECT COUNT(*) FROM job_skills)           AS job_skills;
