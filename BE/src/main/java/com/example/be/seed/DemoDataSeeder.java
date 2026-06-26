package com.example.be.seed;

import com.example.be.entity.*;
import com.example.be.entity.enums.*;
import com.example.be.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@Profile("seed")
@RequiredArgsConstructor
public class DemoDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CvFileRepository cvFileRepository;
    private final CvParseResultRepository cvParseResultRepository;
    private final SkillRepository skillRepository;
    private final JobRepository jobRepository;
    private final JobCriteriaRepository jobCriteriaRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEMO_PASSWORD = "Demo@123";
    private static final int TARGET_JOBS = 100; // guard: skip if already have this many

    private final Random rnd = new Random(42);

    // ── Industry job templates: title, level, type ────────
    private static final Map<String, List<String[]>> INDUSTRY_JOBS = new LinkedHashMap<>();
    static {
        // CNTT – Công nghệ thông tin
        INDUSTRY_JOBS.put("CNTT", List.of(
            new String[]{"Kỹ sư Backend Java Senior", "SENIOR", "FULL_TIME"},
            new String[]{"Backend Developer Python", "MID", "FULL_TIME"},
            new String[]{"Backend Developer Node.js", "MID", "FULL_TIME"},
            new String[]{"Backend Developer Go", "SENIOR", "FULL_TIME"},
            new String[]{"Backend Developer PHP Laravel", "JUNIOR", "FULL_TIME"},
            new String[]{"Frontend Developer React.js", "MID", "FULL_TIME"},
            new String[]{"Frontend Developer Vue.js", "MID", "FULL_TIME"},
            new String[]{"Frontend Developer Angular", "SENIOR", "FULL_TIME"},
            new String[]{"Full Stack Developer MERN", "MID", "FULL_TIME"},
            new String[]{"Full Stack Developer Java + React", "SENIOR", "FULL_TIME"},
            new String[]{"Mobile Developer Android", "MID", "FULL_TIME"},
            new String[]{"Mobile Developer iOS Swift", "MID", "FULL_TIME"},
            new String[]{"Mobile Developer Flutter", "MID", "FULL_TIME"},
            new String[]{"Mobile Developer React Native", "JUNIOR", "FULL_TIME"},
            new String[]{"DevOps Engineer AWS", "SENIOR", "FULL_TIME"},
            new String[]{"DevOps Engineer Kubernetes", "MID", "FULL_TIME"},
            new String[]{"Site Reliability Engineer", "SENIOR", "FULL_TIME"},
            new String[]{"Cloud Architect Azure", "SENIOR", "FULL_TIME"},
            new String[]{"Data Engineer Apache Spark", "SENIOR", "FULL_TIME"},
            new String[]{"Data Engineer ETL Pipeline", "MID", "FULL_TIME"},
            new String[]{"Data Scientist Machine Learning", "SENIOR", "FULL_TIME"},
            new String[]{"AI/ML Engineer Deep Learning", "SENIOR", "FULL_TIME"},
            new String[]{"NLP Engineer", "SENIOR", "FULL_TIME"},
            new String[]{"Computer Vision Engineer", "MID", "FULL_TIME"},
            new String[]{"QA Engineer Automation", "MID", "FULL_TIME"},
            new String[]{"QA Engineer Manual", "JUNIOR", "FULL_TIME"},
            new String[]{"QA Lead", "LEAD", "FULL_TIME"},
            new String[]{"System Analyst", "MID", "FULL_TIME"},
            new String[]{"Business Analyst IT", "MID", "FULL_TIME"},
            new String[]{"Product Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Product Owner", "MID", "FULL_TIME"},
            new String[]{"Scrum Master", "MID", "FULL_TIME"},
            new String[]{"Technical Lead Backend", "LEAD", "FULL_TIME"},
            new String[]{"Technical Lead Frontend", "LEAD", "FULL_TIME"},
            new String[]{"Software Architect", "SENIOR", "FULL_TIME"},
            new String[]{"Database Administrator PostgreSQL", "MID", "FULL_TIME"},
            new String[]{"Database Administrator MySQL", "MID", "FULL_TIME"},
            new String[]{"Network Engineer", "MID", "FULL_TIME"},
            new String[]{"Security Engineer Penetration Testing", "SENIOR", "FULL_TIME"},
            new String[]{"Cyber Security Analyst", "MID", "FULL_TIME"},
            new String[]{"Embedded Software Engineer", "MID", "FULL_TIME"},
            new String[]{"Game Developer Unity", "MID", "FULL_TIME"},
            new String[]{"Blockchain Developer", "SENIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Lập trình Java", "INTERN", "INTERNSHIP"},
            new String[]{"Thực tập sinh Frontend React", "INTERN", "INTERNSHIP"},
            new String[]{"Junior Backend Developer", "JUNIOR", "FULL_TIME"},
            new String[]{"IT Support Engineer", "JUNIOR", "FULL_TIME"},
            new String[]{"Cloud Solutions Engineer", "MID", "REMOTE"},
            new String[]{"Platform Engineer", "SENIOR", "HYBRID"},
            new String[]{"Staff Engineer", "SENIOR", "FULL_TIME"}
        ));

        // KINH_DOANH – Kinh doanh / Bán hàng
        INDUSTRY_JOBS.put("KINH_DOANH", List.of(
            new String[]{"Nhân viên Kinh doanh B2B", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Kinh doanh B2C", "MID", "FULL_TIME"},
            new String[]{"Key Account Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Sales Manager miền Bắc", "MANAGER", "FULL_TIME"},
            new String[]{"Sales Manager miền Nam", "MANAGER", "FULL_TIME"},
            new String[]{"Trưởng phòng Kinh doanh", "LEAD", "FULL_TIME"},
            new String[]{"Giám đốc Kinh doanh vùng", "MANAGER", "FULL_TIME"},
            new String[]{"Business Development Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Partnership Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Account Executive", "MID", "FULL_TIME"},
            new String[]{"Inside Sales Representative", "JUNIOR", "FULL_TIME"},
            new String[]{"Field Sales Representative", "JUNIOR", "FULL_TIME"},
            new String[]{"Telesales Agent", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên tư vấn bán hàng", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên phát triển thị trường", "MID", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh Bất động sản", "MID", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh Bảo hiểm", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh Xuất nhập khẩu", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên phân tích bán hàng", "MID", "FULL_TIME"},
            new String[]{"Sales Operations Specialist", "MID", "FULL_TIME"},
            new String[]{"Trade Marketing Executive", "MID", "FULL_TIME"},
            new String[]{"Merchandiser", "JUNIOR", "FULL_TIME"},
            new String[]{"Supervisor bán hàng", "MID", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh FMCG", "MID", "FULL_TIME"},
            new String[]{"Channel Sales Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Retail Store Manager", "MID", "FULL_TIME"},
            new String[]{"E-commerce Sales Specialist", "MID", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh phần mềm", "MID", "FULL_TIME"},
            new String[]{"Corporate Sales Executive", "MID", "FULL_TIME"},
            new String[]{"Pre-sales Consultant", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên tư vấn du học", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên bán hàng online", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên phát triển sản phẩm mới", "MID", "FULL_TIME"},
            new String[]{"Thực tập sinh Kinh doanh", "INTERN", "INTERNSHIP"},
            new String[]{"Thực tập sinh Business Development", "INTERN", "INTERNSHIP"},
            new String[]{"Nhân viên Export", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Import", "JUNIOR", "FULL_TIME"},
            new String[]{"National Sales Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Sales Trainer", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh Logistics", "MID", "FULL_TIME"},
            new String[]{"Nhân viên đại lý phân phối", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên CRM", "MID", "FULL_TIME"},
            new String[]{"Revenue Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Category Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên tư vấn tài chính cá nhân", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh xe ô tô", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên tư vấn giải pháp", "MID", "FULL_TIME"},
            new String[]{"Nhân viên phát triển nhượng quyền", "MID", "FULL_TIME"},
            new String[]{"Giám đốc bán hàng khu vực", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên viên đàm phán hợp đồng", "SENIOR", "FULL_TIME"}
        ));

        // MARKETING
        INDUSTRY_JOBS.put("MARKETING", List.of(
            new String[]{"Digital Marketing Executive", "JUNIOR", "FULL_TIME"},
            new String[]{"Digital Marketing Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Content Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Content Creator", "JUNIOR", "FULL_TIME"},
            new String[]{"SEO Specialist", "MID", "FULL_TIME"},
            new String[]{"SEO Manager", "SENIOR", "FULL_TIME"},
            new String[]{"SEM/PPC Specialist Google Ads", "MID", "FULL_TIME"},
            new String[]{"Social Media Manager", "MID", "FULL_TIME"},
            new String[]{"Social Media Executive", "JUNIOR", "FULL_TIME"},
            new String[]{"Community Manager", "MID", "FULL_TIME"},
            new String[]{"Brand Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Brand Executive", "JUNIOR", "FULL_TIME"},
            new String[]{"Marketing Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Marketing Director", "MANAGER", "FULL_TIME"},
            new String[]{"Performance Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Growth Hacker", "MID", "FULL_TIME"},
            new String[]{"Email Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"CRM Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Product Marketing Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Marketing Analyst", "MID", "FULL_TIME"},
            new String[]{"PR Executive", "JUNIOR", "FULL_TIME"},
            new String[]{"PR Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Event Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Trade Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Marketing Automation Specialist", "MID", "FULL_TIME"},
            new String[]{"Influencer Marketing Executive", "JUNIOR", "FULL_TIME"},
            new String[]{"Video Content Creator", "MID", "FULL_TIME"},
            new String[]{"Copywriter", "JUNIOR", "FULL_TIME"},
            new String[]{"Copy Lead / Senior Copywriter", "SENIOR", "FULL_TIME"},
            new String[]{"Creative Director", "LEAD", "FULL_TIME"},
            new String[]{"Art Director", "SENIOR", "FULL_TIME"},
            new String[]{"Affiliate Marketing Manager", "MID", "FULL_TIME"},
            new String[]{"Media Planner", "MID", "FULL_TIME"},
            new String[]{"Media Buyer Facebook Ads", "MID", "FULL_TIME"},
            new String[]{"Marketing Coordinator", "JUNIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Marketing", "INTERN", "INTERNSHIP"},
            new String[]{"Thực tập sinh Content", "INTERN", "INTERNSHIP"},
            new String[]{"E-commerce Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Loyalty Program Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Marketing Research Analyst", "MID", "FULL_TIME"},
            new String[]{"Campaign Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Category Marketing Manager", "MID", "FULL_TIME"},
            new String[]{"Inbound Marketing Specialist", "MID", "REMOTE"},
            new String[]{"B2B Marketing Specialist", "MID", "FULL_TIME"},
            new String[]{"Customer Acquisition Specialist", "MID", "FULL_TIME"},
            new String[]{"Retention Marketing Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Podcast/Audio Content Producer", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên phân tích dữ liệu marketing", "MID", "FULL_TIME"},
            new String[]{"Localization Marketing Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Head of Marketing", "MANAGER", "FULL_TIME"}
        ));

        // KE_TOAN – Kế toán / Kiểm toán
        INDUSTRY_JOBS.put("KE_TOAN", List.of(
            new String[]{"Kế toán Tổng hợp", "MID", "FULL_TIME"},
            new String[]{"Kế toán Trưởng", "LEAD", "FULL_TIME"},
            new String[]{"Kế toán Thuế", "MID", "FULL_TIME"},
            new String[]{"Kế toán Công nợ", "JUNIOR", "FULL_TIME"},
            new String[]{"Kế toán Ngân hàng", "MID", "FULL_TIME"},
            new String[]{"Kế toán Kho", "JUNIOR", "FULL_TIME"},
            new String[]{"Kế toán Lương", "MID", "FULL_TIME"},
            new String[]{"Kế toán Giá thành", "MID", "FULL_TIME"},
            new String[]{"Kế toán Nội bộ", "MID", "FULL_TIME"},
            new String[]{"Kiểm toán Nội bộ", "SENIOR", "FULL_TIME"},
            new String[]{"Kiểm toán viên", "MID", "FULL_TIME"},
            new String[]{"Kiểm toán Cao cấp", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Kiểm soát Nội bộ", "SENIOR", "FULL_TIME"},
            new String[]{"Giám đốc Tài chính CFO", "MANAGER", "FULL_TIME"},
            new String[]{"Trưởng phòng Tài chính", "LEAD", "FULL_TIME"},
            new String[]{"Chuyên viên Phân tích Tài chính", "MID", "FULL_TIME"},
            new String[]{"Financial Controller", "SENIOR", "FULL_TIME"},
            new String[]{"Treasury Specialist", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Lập kế hoạch Tài chính", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Thanh toán", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Tư vấn Thuế", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Hải quan", "MID", "FULL_TIME"},
            new String[]{"Thực tập sinh Kế toán", "INTERN", "INTERNSHIP"},
            new String[]{"Thực tập sinh Kiểm toán", "INTERN", "INTERNSHIP"},
            new String[]{"Junior Accountant", "JUNIOR", "FULL_TIME"},
            new String[]{"Senior Accountant", "SENIOR", "FULL_TIME"},
            new String[]{"Accounts Payable Specialist", "MID", "FULL_TIME"},
            new String[]{"Accounts Receivable Specialist", "MID", "FULL_TIME"},
            new String[]{"Cost Accountant", "MID", "FULL_TIME"},
            new String[]{"Tax Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Budget Analyst", "MID", "FULL_TIME"},
            new String[]{"Compliance Officer", "SENIOR", "FULL_TIME"},
            new String[]{"Risk Management Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Quản lý Rủi ro", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Đầu tư Tài chính", "SENIOR", "FULL_TIME"},
            new String[]{"Portfolio Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Kế toán Xây dựng", "MID", "FULL_TIME"},
            new String[]{"Kế toán Xuất Nhập Khẩu", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Kinh doanh Chứng khoán", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Phân tích Đầu tư", "SENIOR", "FULL_TIME"},
            new String[]{"Trưởng phòng Kế toán", "LEAD", "FULL_TIME"},
            new String[]{"Chuyên viên Kế toán Quản trị", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên Kế toán Dự án", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Báo cáo Tài chính", "MID", "FULL_TIME"},
            new String[]{"Audit Senior", "SENIOR", "FULL_TIME"},
            new String[]{"Audit Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên viên Kế toán Ngân hàng Đầu tư", "SENIOR", "FULL_TIME"},
            new String[]{"Kế toán Doanh nghiệp Vừa và Nhỏ", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Soát xét Hợp đồng", "MID", "FULL_TIME"},
            new String[]{"IFRS Reporting Specialist", "SENIOR", "FULL_TIME"}
        ));

        // NHAN_SU – Nhân sự / Hành chính
        INDUSTRY_JOBS.put("NHAN_SU", List.of(
            new String[]{"Chuyên viên Tuyển dụng", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Tuyển dụng IT", "MID", "FULL_TIME"},
            new String[]{"Headhunter / Executive Search", "SENIOR", "FULL_TIME"},
            new String[]{"HR Business Partner", "SENIOR", "FULL_TIME"},
            new String[]{"HR Manager", "MANAGER", "FULL_TIME"},
            new String[]{"HR Director", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên viên Đào tạo & Phát triển", "MID", "FULL_TIME"},
            new String[]{"Training Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Lương Thưởng & Phúc lợi", "MID", "FULL_TIME"},
            new String[]{"C&B Specialist", "MID", "FULL_TIME"},
            new String[]{"C&B Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Quan hệ Lao động", "MID", "FULL_TIME"},
            new String[]{"HRBP Senior", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Nhân sự Tổng hợp", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Hành chính Văn phòng", "JUNIOR", "FULL_TIME"},
            new String[]{"Trưởng phòng Hành chính Nhân sự", "LEAD", "FULL_TIME"},
            new String[]{"Chuyên viên BHXH", "JUNIOR", "FULL_TIME"},
            new String[]{"People Operations Specialist", "MID", "FULL_TIME"},
            new String[]{"Talent Acquisition Specialist", "MID", "FULL_TIME"},
            new String[]{"Talent Acquisition Lead", "LEAD", "FULL_TIME"},
            new String[]{"Employer Branding Specialist", "MID", "FULL_TIME"},
            new String[]{"Organizational Development Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"HR Analyst", "MID", "FULL_TIME"},
            new String[]{"HRIS Specialist", "MID", "FULL_TIME"},
            new String[]{"Payroll Specialist", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Quản lý Hiệu suất", "SENIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Nhân sự", "INTERN", "INTERNSHIP"},
            new String[]{"Nhân viên Lễ tân", "JUNIOR", "FULL_TIME"},
            new String[]{"Trợ lý Hành chính", "JUNIOR", "FULL_TIME"},
            new String[]{"Executive Assistant", "MID", "FULL_TIME"},
            new String[]{"Office Manager", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Văn hóa Doanh nghiệp", "MID", "FULL_TIME"},
            new String[]{"Diversity & Inclusion Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Learning & Development Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Wellness Program Coordinator", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Chính sách Nhân sự", "MID", "FULL_TIME"},
            new String[]{"HR Coordinator", "JUNIOR", "FULL_TIME"},
            new String[]{"Recruitment Coordinator", "JUNIOR", "FULL_TIME"},
            new String[]{"Senior HR Executive", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Tuyển dụng hàng loạt", "MID", "FULL_TIME"},
            new String[]{"Campus Recruitment Specialist", "MID", "FULL_TIME"},
            new String[]{"Trưởng phòng Tuyển dụng", "LEAD", "FULL_TIME"},
            new String[]{"Chief People Officer", "MANAGER", "FULL_TIME"},
            new String[]{"Nhân viên Quản lý Hồ sơ", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Nội quy Doanh nghiệp", "MID", "FULL_TIME"},
            new String[]{"HR Generalist", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Bảo vệ An ninh", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên An toàn Lao động", "MID", "FULL_TIME"},
            new String[]{"HSE Specialist", "MID", "FULL_TIME"},
            new String[]{"Compensation & Benefits Analyst", "MID", "FULL_TIME"}
        ));

        // CHAM_SOC_KH – Chăm sóc khách hàng
        INDUSTRY_JOBS.put("CHAM_SOC_KH", List.of(
            new String[]{"Nhân viên Chăm sóc Khách hàng", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Dịch vụ Khách hàng", "MID", "FULL_TIME"},
            new String[]{"Customer Service Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Trưởng nhóm CSKH", "LEAD", "FULL_TIME"},
            new String[]{"Nhân viên Tổng đài Inbound", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Tổng đài Outbound", "JUNIOR", "FULL_TIME"},
            new String[]{"Customer Success Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Customer Experience Specialist", "MID", "FULL_TIME"},
            new String[]{"Technical Support Engineer", "MID", "FULL_TIME"},
            new String[]{"Help Desk Specialist", "JUNIOR", "FULL_TIME"},
            new String[]{"Customer Onboarding Specialist", "MID", "FULL_TIME"},
            new String[]{"After-Sales Service Specialist", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Xử lý Khiếu nại", "MID", "FULL_TIME"},
            new String[]{"Social Listening & Response Specialist", "MID", "FULL_TIME"},
            new String[]{"Loyalty & Retention Specialist", "MID", "FULL_TIME"},
            new String[]{"VIP Customer Relations Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Call Center Agent", "JUNIOR", "FULL_TIME"},
            new String[]{"Call Center Team Leader", "MID", "FULL_TIME"},
            new String[]{"Call Center Quality Assurance", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Đặt hàng & Xử lý đơn", "JUNIOR", "FULL_TIME"},
            new String[]{"Order Fulfillment Specialist", "MID", "FULL_TIME"},
            new String[]{"Customer Data Analyst", "MID", "FULL_TIME"},
            new String[]{"Nhân viên giao nhận / Last-mile", "JUNIOR", "FULL_TIME"},
            new String[]{"CX Research Specialist", "MID", "FULL_TIME"},
            new String[]{"Chatbot & AI Support Specialist", "MID", "FULL_TIME"},
            new String[]{"Thực tập sinh CSKH", "INTERN", "INTERNSHIP"},
            new String[]{"Nhân viên Tiếp đón / Lễ tân", "JUNIOR", "FULL_TIME"},
            new String[]{"Tư vấn Bán hàng trực tiếp", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Hỗ trợ Kỹ thuật", "MID", "FULL_TIME"},
            new String[]{"Customer Operations Specialist", "MID", "FULL_TIME"},
            new String[]{"Account Management Executive", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên CSKH Ngân hàng", "MID", "FULL_TIME"},
            new String[]{"Nhân viên CSKH Bảo hiểm", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Hỗ trợ Ứng dụng", "JUNIOR", "FULL_TIME"},
            new String[]{"Customer Relations Officer", "MID", "FULL_TIME"},
            new String[]{"Trưởng phòng Dịch vụ Khách hàng", "LEAD", "FULL_TIME"},
            new String[]{"Customer Feedback Analyst", "MID", "FULL_TIME"},
            new String[]{"NPS Champion Specialist", "MID", "FULL_TIME"},
            new String[]{"Nhân viên CSKH E-commerce", "JUNIOR", "FULL_TIME"},
            new String[]{"Digital Customer Support Specialist", "MID", "HYBRID"},
            new String[]{"Remote Customer Success Agent", "JUNIOR", "REMOTE"},
            new String[]{"Chuyên viên đào tạo CSKH", "SENIOR", "FULL_TIME"},
            new String[]{"Head of Customer Experience", "MANAGER", "FULL_TIME"},
            new String[]{"Complaint Resolution Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên CSKH Tiếng Anh", "MID", "FULL_TIME"},
            new String[]{"Nhân viên CSKH Tiếng Nhật", "MID", "FULL_TIME"},
            new String[]{"Nhân viên CSKH Tiếng Trung", "MID", "FULL_TIME"},
            new String[]{"Customer Journey Analyst", "SENIOR", "FULL_TIME"},
            new String[]{"Voice of Customer Program Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Customer Intelligence Specialist", "MID", "FULL_TIME"}
        ));

        // XAY_DUNG – Xây dựng / Kiến trúc
        INDUSTRY_JOBS.put("XAY_DUNG", List.of(
            new String[]{"Kiến trúc sư", "MID", "FULL_TIME"},
            new String[]{"Kiến trúc sư trưởng", "LEAD", "FULL_TIME"},
            new String[]{"Kỹ sư Kết cấu", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Xây dựng Dân dụng", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Cơ điện MEP", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Địa chất", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Khảo sát", "JUNIOR", "FULL_TIME"},
            new String[]{"Kỹ sư Giao thông", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Thủy lợi", "MID", "FULL_TIME"},
            new String[]{"Chỉ huy trưởng Công trường", "SENIOR", "FULL_TIME"},
            new String[]{"Giám sát Thi công", "MID", "FULL_TIME"},
            new String[]{"Quản lý Dự án Xây dựng", "SENIOR", "FULL_TIME"},
            new String[]{"Project Manager BDS", "SENIOR", "FULL_TIME"},
            new String[]{"Dự toán viên Xây dựng", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư QS Quantity Surveyor", "SENIOR", "FULL_TIME"},
            new String[]{"Thiết kế Nội thất", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Thiết kế Nội thất cao cấp", "SENIOR", "FULL_TIME"},
            new String[]{"Họa viên AutoCAD", "JUNIOR", "FULL_TIME"},
            new String[]{"BIM Coordinator", "MID", "FULL_TIME"},
            new String[]{"BIM Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ sư An toàn Công trường", "MID", "FULL_TIME"},
            new String[]{"HSE Officer", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Mua sắm Vật tư Xây dựng", "MID", "FULL_TIME"},
            new String[]{"Trưởng phòng Kỹ thuật", "LEAD", "FULL_TIME"},
            new String[]{"Chuyên viên Thẩm định Dự án", "SENIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Kỹ thuật Xây dựng", "INTERN", "INTERNSHIP"},
            new String[]{"Kỹ sư Hạ tầng Kỹ thuật", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư Thiết kế cầu đường", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ sư M&E", "MID", "FULL_TIME"},
            new String[]{"Trưởng phòng thiết kế", "LEAD", "FULL_TIME"},
            new String[]{"Nhân viên giám sát chất lượng", "MID", "FULL_TIME"},
            new String[]{"Construction Manager", "MANAGER", "FULL_TIME"},
            new String[]{"Kỹ sư lắp đặt điện nhẹ", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư cấp thoát nước", "MID", "FULL_TIME"},
            new String[]{"Nhân viên phát triển dự án BDS", "MID", "FULL_TIME"},
            new String[]{"Property Developer", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên thiết kế cảnh quan", "MID", "FULL_TIME"},
            new String[]{"Urban Planner", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ sư Phòng cháy chữa cháy", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên pháp lý Bất động sản", "MID", "FULL_TIME"},
            new String[]{"Nhân viên kinh doanh BDS", "MID", "FULL_TIME"},
            new String[]{"Thiết kế 3D Revit", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư tư vấn giám sát", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên hồ sơ thầu", "MID", "FULL_TIME"},
            new String[]{"Quản lý Facility", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên vận hành tòa nhà", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư điện mặt trời", "MID", "FULL_TIME"},
            new String[]{"Kỹ sư thi công phần ngầm", "MID", "FULL_TIME"},
            new String[]{"Giám đốc kỹ thuật xây dựng", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên gia tư vấn xây dựng", "SENIOR", "FULL_TIME"}
        ));

        // GIAO_DUC – Giáo dục / Đào tạo
        INDUSTRY_JOBS.put("GIAO_DUC", List.of(
            new String[]{"Giáo viên Tiếng Anh", "MID", "FULL_TIME"},
            new String[]{"Giáo viên Toán THPT", "MID", "FULL_TIME"},
            new String[]{"Giáo viên Mầm non", "JUNIOR", "FULL_TIME"},
            new String[]{"Giảng viên Đại học CNTT", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Đào tạo Doanh nghiệp", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Thiết kế Chương trình", "MID", "FULL_TIME"},
            new String[]{"E-Learning Developer", "MID", "FULL_TIME"},
            new String[]{"Instructional Designer", "MID", "FULL_TIME"},
            new String[]{"Tư vấn Tuyển sinh", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên quản lý học viên", "JUNIOR", "FULL_TIME"},
            new String[]{"Quản lý Trung tâm Anh ngữ", "MID", "FULL_TIME"},
            new String[]{"Hiệu trưởng / Trưởng cơ sở", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên viên Phát triển Học liệu", "MID", "FULL_TIME"},
            new String[]{"Learning Experience Designer", "MID", "FULL_TIME"},
            new String[]{"Giáo viên Yoga / Fitness", "JUNIOR", "FULL_TIME"},
            new String[]{"Giáo viên Âm nhạc", "JUNIOR", "FULL_TIME"},
            new String[]{"Giáo viên Mỹ thuật", "JUNIOR", "FULL_TIME"},
            new String[]{"Giáo viên Lập trình cho trẻ em", "MID", "FULL_TIME"},
            new String[]{"Gia sư Toán Lý Hóa", "JUNIOR", "PART_TIME"},
            new String[]{"Trợ giảng Tiếng Anh", "JUNIOR", "FULL_TIME"},
            new String[]{"Academic Coordinator", "MID", "FULL_TIME"},
            new String[]{"School Principal", "MANAGER", "FULL_TIME"},
            new String[]{"Academic Director", "MANAGER", "FULL_TIME"},
            new String[]{"Chuyên viên Kiểm định Chất lượng Giáo dục", "SENIOR", "FULL_TIME"},
            new String[]{"Quản lý Dự án Giáo dục", "SENIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Thiết kế Khóa học", "INTERN", "INTERNSHIP"},
            new String[]{"Chuyên viên Nghiên cứu Khoa học", "SENIOR", "FULL_TIME"},
            new String[]{"Giáo viên dạy kỹ năng mềm", "MID", "FULL_TIME"},
            new String[]{"Mentor / Coach Nghề nghiệp", "SENIOR", "FULL_TIME"},
            new String[]{"EdTech Product Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên Hỗ trợ Sinh viên", "JUNIOR", "FULL_TIME"},
            new String[]{"Content Education Writer", "MID", "FULL_TIME"},
            new String[]{"Assessment Specialist", "MID", "FULL_TIME"},
            new String[]{"Language Trainer Corporate", "MID", "FULL_TIME"},
            new String[]{"IELTS Trainer", "MID", "FULL_TIME"},
            new String[]{"TOEIC Trainer", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Hướng nghiệp", "MID", "FULL_TIME"},
            new String[]{"Counselor Tâm lý học đường", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Nghiên cứu Thị trường Giáo dục", "MID", "FULL_TIME"},
            new String[]{"Social Worker Giáo dục", "MID", "FULL_TIME"},
            new String[]{"Giáo viên STEM", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Đánh giá Chương trình", "SENIOR", "FULL_TIME"},
            new String[]{"Giáo viên Tiếng Nhật", "MID", "FULL_TIME"},
            new String[]{"Giáo viên Tiếng Hàn", "MID", "FULL_TIME"},
            new String[]{"Giáo viên Tiếng Trung", "MID", "FULL_TIME"},
            new String[]{"Giảng viên Kế toán", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Phát triển Đối tác Giáo dục", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Vận hành Nền tảng E-learning", "MID", "FULL_TIME"},
            new String[]{"Training Content Specialist", "MID", "FULL_TIME"},
            new String[]{"Head of Education", "MANAGER", "FULL_TIME"}
        ));

        // Y_TE – Y tế / Dược phẩm
        INDUSTRY_JOBS.put("Y_TE", List.of(
            new String[]{"Bác sĩ Đa khoa", "MID", "FULL_TIME"},
            new String[]{"Bác sĩ Nội khoa", "SENIOR", "FULL_TIME"},
            new String[]{"Bác sĩ Ngoại khoa", "SENIOR", "FULL_TIME"},
            new String[]{"Bác sĩ Nhi khoa", "MID", "FULL_TIME"},
            new String[]{"Bác sĩ Da liễu", "MID", "FULL_TIME"},
            new String[]{"Bác sĩ Răng Hàm Mặt", "MID", "FULL_TIME"},
            new String[]{"Điều dưỡng viên", "JUNIOR", "FULL_TIME"},
            new String[]{"Y tá", "JUNIOR", "FULL_TIME"},
            new String[]{"Dược sĩ Lâm sàng", "MID", "FULL_TIME"},
            new String[]{"Dược sĩ Bán lẻ", "JUNIOR", "FULL_TIME"},
            new String[]{"Trình dược viên ETC", "MID", "FULL_TIME"},
            new String[]{"Trình dược viên OTC", "MID", "FULL_TIME"},
            new String[]{"Medical Representative", "MID", "FULL_TIME"},
            new String[]{"Product Specialist Dược phẩm", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ thuật viên Xét nghiệm", "MID", "FULL_TIME"},
            new String[]{"Kỹ thuật viên Chẩn đoán hình ảnh", "MID", "FULL_TIME"},
            new String[]{"Kỹ thuật viên Vật lý trị liệu", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Dinh dưỡng", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Y tế cộng đồng", "MID", "FULL_TIME"},
            new String[]{"Quản lý Phòng khám / Bệnh viện", "MANAGER", "FULL_TIME"},
            new String[]{"Giám đốc Y khoa", "MANAGER", "FULL_TIME"},
            new String[]{"Regulatory Affairs Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Clinical Research Coordinator", "MID", "FULL_TIME"},
            new String[]{"Medical Science Liaison", "SENIOR", "FULL_TIME"},
            new String[]{"Healthcare IT Specialist", "MID", "FULL_TIME"},
            new String[]{"Dược sĩ Kiểm nghiệm", "MID", "FULL_TIME"},
            new String[]{"Dược sĩ QA/QC", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ sư Thiết bị Y tế", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Mua sắm Thiết bị Y tế", "MID", "FULL_TIME"},
            new String[]{"Thực tập sinh Dược khoa", "INTERN", "INTERNSHIP"},
            new String[]{"Chuyên viên Đào tạo Y khoa", "SENIOR", "FULL_TIME"},
            new String[]{"Health Data Analyst", "MID", "FULL_TIME"},
            new String[]{"Hospital Administrator", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên gia Sức khỏe Tâm thần", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên Tiếp nhận Bệnh nhân", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Quản lý Hồ sơ Bệnh án", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Kinh doanh Thiết bị Y tế", "MID", "FULL_TIME"},
            new String[]{"Market Access Manager Dược phẩm", "SENIOR", "FULL_TIME"},
            new String[]{"Brand Manager Dược phẩm", "SENIOR", "FULL_TIME"},
            new String[]{"Pharmacovigilance Specialist", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Nghiên cứu Lâm sàng", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ thuật viên Dụng cụ Phẫu thuật", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Kiểm soát Nhiễm khuẩn", "MID", "FULL_TIME"},
            new String[]{"Optometrist Kỹ thuật viên đo mắt", "MID", "FULL_TIME"},
            new String[]{"Audiologist Chuyên gia thính học", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Tâm lý lâm sàng", "SENIOR", "FULL_TIME"},
            new String[]{"Cận lâm sàng Sinh hóa", "MID", "FULL_TIME"},
            new String[]{"Điều phối viên Huyết học", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Kiểm dịch Y tế", "MID", "FULL_TIME"},
            new String[]{"Healthcare Marketing Manager", "SENIOR", "FULL_TIME"}
        ));

        // LAO_DONG_PT – Lao động phổ thông
        INDUSTRY_JOBS.put("LAO_DONG_PT", List.of(
            new String[]{"Công nhân May mặc", "JUNIOR", "FULL_TIME"},
            new String[]{"Công nhân Điện tử", "JUNIOR", "FULL_TIME"},
            new String[]{"Công nhân Sản xuất", "JUNIOR", "FULL_TIME"},
            new String[]{"Công nhân Lắp ráp linh kiện", "JUNIOR", "FULL_TIME"},
            new String[]{"Công nhân Cơ khí", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Kho vận", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Đóng gói", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Giao hàng", "JUNIOR", "FULL_TIME"},
            new String[]{"Tài xế Xe tải hạng nặng", "MID", "FULL_TIME"},
            new String[]{"Tài xế Xe tải nhỏ", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Bảo vệ", "JUNIOR", "FULL_TIME"},
            new String[]{"Bảo vệ trưởng ca", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Vệ sinh Công nghiệp", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Phục vụ nhà hàng", "JUNIOR", "FULL_TIME"},
            new String[]{"Đầu bếp", "MID", "FULL_TIME"},
            new String[]{"Phụ bếp", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Bar / Barista", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Thu ngân", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Bán hàng siêu thị", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Lễ tân Khách sạn", "JUNIOR", "FULL_TIME"},
            new String[]{"Buồng phòng Khách sạn", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Giặt là", "JUNIOR", "FULL_TIME"},
            new String[]{"Thợ Sơn", "JUNIOR", "FULL_TIME"},
            new String[]{"Thợ Hàn", "MID", "FULL_TIME"},
            new String[]{"Thợ Cơ khí", "MID", "FULL_TIME"},
            new String[]{"Thợ Điện", "MID", "FULL_TIME"},
            new String[]{"Thợ Ống nước", "MID", "FULL_TIME"},
            new String[]{"Thợ Mộc", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Kiểm tra Chất lượng QC", "MID", "FULL_TIME"},
            new String[]{"Trưởng ca Sản xuất", "MID", "FULL_TIME"},
            new String[]{"Giám sát Sản xuất", "SENIOR", "FULL_TIME"},
            new String[]{"Kỹ thuật viên Bảo trì Máy", "MID", "FULL_TIME"},
            new String[]{"Vận hành Máy CNC", "MID", "FULL_TIME"},
            new String[]{"Nhân viên Bốc dỡ Hàng hóa", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Sắp xếp Kho", "JUNIOR", "FULL_TIME"},
            new String[]{"Shipper Giao hàng", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Rửa xe", "JUNIOR", "PART_TIME"},
            new String[]{"Nhân viên Cắt tóc", "JUNIOR", "FULL_TIME"},
            new String[]{"Thợ may Công nghiệp", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Nail", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Massage trị liệu", "MID", "FULL_TIME"},
            new String[]{"Giữ trẻ / Ô sin", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Cơm văn phòng", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên Quét dọn đường", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên trực kho đêm", "JUNIOR", "FULL_TIME"},
            new String[]{"Lái xe công ty", "MID", "FULL_TIME"},
            new String[]{"Lái xe Container", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên Canh gác Công trình", "JUNIOR", "FULL_TIME"},
            new String[]{"Nhân viên phát tờ rơi", "JUNIOR", "PART_TIME"},
            new String[]{"Công nhân Xây dựng", "JUNIOR", "FULL_TIME"}
        ));

        // THIET_KE – Thiết kế / Sáng tạo
        INDUSTRY_JOBS.put("THIET_KE", List.of(
            new String[]{"UI Designer", "MID", "FULL_TIME"},
            new String[]{"UX Designer", "MID", "FULL_TIME"},
            new String[]{"UI/UX Designer", "MID", "FULL_TIME"},
            new String[]{"Senior UI/UX Designer", "SENIOR", "FULL_TIME"},
            new String[]{"Product Designer", "SENIOR", "FULL_TIME"},
            new String[]{"Graphic Designer", "JUNIOR", "FULL_TIME"},
            new String[]{"Senior Graphic Designer", "SENIOR", "FULL_TIME"},
            new String[]{"Creative Director", "MANAGER", "FULL_TIME"},
            new String[]{"Art Director", "LEAD", "FULL_TIME"},
            new String[]{"Brand Designer", "MID", "FULL_TIME"},
            new String[]{"Visual Designer", "MID", "FULL_TIME"},
            new String[]{"Motion Graphics Designer", "MID", "FULL_TIME"},
            new String[]{"2D Animator", "MID", "FULL_TIME"},
            new String[]{"3D Modeler / Artist", "MID", "FULL_TIME"},
            new String[]{"3D Animator", "SENIOR", "FULL_TIME"},
            new String[]{"Video Editor", "MID", "FULL_TIME"},
            new String[]{"Senior Video Editor", "SENIOR", "FULL_TIME"},
            new String[]{"Photographer / Videographer", "MID", "FULL_TIME"},
            new String[]{"Photo Retoucher", "JUNIOR", "FULL_TIME"},
            new String[]{"Illustrator", "MID", "FULL_TIME"},
            new String[]{"Package Designer", "MID", "FULL_TIME"},
            new String[]{"Print Production Designer", "MID", "FULL_TIME"},
            new String[]{"Web Designer", "MID", "FULL_TIME"},
            new String[]{"Thực tập sinh Thiết kế Đồ họa", "INTERN", "INTERNSHIP"},
            new String[]{"Thực tập sinh UI/UX", "INTERN", "INTERNSHIP"},
            new String[]{"E-commerce Designer", "MID", "FULL_TIME"},
            new String[]{"Social Media Designer", "JUNIOR", "FULL_TIME"},
            new String[]{"Presentation Designer", "MID", "FULL_TIME"},
            new String[]{"Exhibition Designer", "SENIOR", "FULL_TIME"},
            new String[]{"Spatial Designer / Interior", "MID", "FULL_TIME"},
            new String[]{"Fashion Designer", "MID", "FULL_TIME"},
            new String[]{"Textile Designer", "MID", "FULL_TIME"},
            new String[]{"Industrial Designer", "MID", "FULL_TIME"},
            new String[]{"Design Researcher", "MID", "FULL_TIME"},
            new String[]{"UX Researcher", "MID", "FULL_TIME"},
            new String[]{"Usability Testing Specialist", "MID", "FULL_TIME"},
            new String[]{"Design System Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Creative Strategist", "SENIOR", "FULL_TIME"},
            new String[]{"Head of Design", "MANAGER", "FULL_TIME"},
            new String[]{"Design Lead", "LEAD", "FULL_TIME"},
            new String[]{"Game Artist / Game Designer", "MID", "FULL_TIME"},
            new String[]{"NFT / Digital Art Creator", "MID", "FULL_TIME"},
            new String[]{"AR/VR Designer", "SENIOR", "FULL_TIME"},
            new String[]{"Figma Prototyping Specialist", "MID", "FULL_TIME"},
            new String[]{"Copywriter sáng tạo", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Thiết kế Nhận diện Thương hiệu", "SENIOR", "FULL_TIME"},
            new String[]{"Nhân viên Dàn trang Sách Báo", "JUNIOR", "FULL_TIME"},
            new String[]{"Content Strategist sáng tạo", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Storyboard", "MID", "FULL_TIME"},
            new String[]{"Character Designer", "MID", "FULL_TIME"}
        ));

        // VAN_TAI – Vận tải / Logistics
        INDUSTRY_JOBS.put("VAN_TAI", List.of(
            new String[]{"Chuyên viên Logistics", "MID", "FULL_TIME"},
            new String[]{"Supply Chain Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Supply Chain Analyst", "MID", "FULL_TIME"},
            new String[]{"Warehouse Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Quản lý Kho vận", "MID", "FULL_TIME"},
            new String[]{"Inventory Control Specialist", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Xuất nhập khẩu", "MID", "FULL_TIME"},
            new String[]{"Customs Broker", "SENIOR", "FULL_TIME"},
            new String[]{"Freight Forwarder", "MID", "FULL_TIME"},
            new String[]{"Ocean Freight Specialist", "MID", "FULL_TIME"},
            new String[]{"Air Freight Specialist", "MID", "FULL_TIME"},
            new String[]{"Fleet Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Dispatcher Điều phối xe", "MID", "FULL_TIME"},
            new String[]{"Operations Manager Logistics", "MANAGER", "FULL_TIME"},
            new String[]{"Last-mile Delivery Manager", "MID", "FULL_TIME"},
            new String[]{"Chuyên viên Mua hàng Procurement", "MID", "FULL_TIME"},
            new String[]{"Purchasing Manager", "SENIOR", "FULL_TIME"},
            new String[]{"3PL Account Manager", "SENIOR", "FULL_TIME"},
            new String[]{"Cold Chain Specialist", "MID", "FULL_TIME"},
            new String[]{"Distribution Center Supervisor", "MID", "FULL_TIME"},
            new String[]{"Transportation Planner", "MID", "FULL_TIME"},
            new String[]{"Import Export Coordinator", "JUNIOR", "FULL_TIME"},
            new String[]{"Shipping Coordinator", "JUNIOR", "FULL_TIME"},
            new String[]{"Logistics Data Analyst", "MID", "FULL_TIME"},
            new String[]{"WMS System Specialist", "MID", "FULL_TIME"},
            new String[]{"TMS Implementation Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Port Operations Specialist", "MID", "FULL_TIME"},
            new String[]{"Forwarding Agent", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Giao nhận Quốc tế", "MID", "FULL_TIME"},
            new String[]{"Tài xế đường dài", "MID", "FULL_TIME"},
            new String[]{"Giám sát Kho Thực phẩm Đông lạnh", "MID", "FULL_TIME"},
            new String[]{"E-commerce Fulfillment Specialist", "MID", "FULL_TIME"},
            new String[]{"Cross-border Trade Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Tuân thủ Hải quan", "MID", "FULL_TIME"},
            new String[]{"Trade Compliance Officer", "SENIOR", "FULL_TIME"},
            new String[]{"Demand Planner", "MID", "FULL_TIME"},
            new String[]{"S&OP Analyst", "MID", "FULL_TIME"},
            new String[]{"Master Production Scheduler", "SENIOR", "FULL_TIME"},
            new String[]{"Thực tập sinh Logistics", "INTERN", "INTERNSHIP"},
            new String[]{"Nhân viên Khai báo Hải quan", "JUNIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Tư vấn Logistics", "SENIOR", "FULL_TIME"},
            new String[]{"Network Optimization Analyst", "SENIOR", "FULL_TIME"},
            new String[]{"Returns & Reverse Logistics Specialist", "MID", "FULL_TIME"},
            new String[]{"Hazardous Material Handler", "MID", "FULL_TIME"},
            new String[]{"Aviation Logistics Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Marine Insurance Specialist", "SENIOR", "FULL_TIME"},
            new String[]{"Chuyên viên Đàm phán hợp đồng Vận tải", "SENIOR", "FULL_TIME"},
            new String[]{"Green Logistics Specialist", "MID", "FULL_TIME"},
            new String[]{"Chief Supply Chain Officer", "MANAGER", "FULL_TIME"},
            new String[]{"Logistics Business Development Manager", "SENIOR", "FULL_TIME"}
        ));
    }

    // ── Skills by industry ────────────────────────────────
    private static final Map<String, List<String>> INDUSTRY_SKILLS = Map.ofEntries(
        Map.entry("CNTT",        List.of("Java","Spring Boot","Python","React","TypeScript","Docker","PostgreSQL","AWS","Git","Node.js","Kubernetes","MongoDB","Redis")),
        Map.entry("KINH_DOANH",  List.of("Excel","SQL","Power BI","Marketing","Negotiation")),
        Map.entry("MARKETING",   List.of("SEO","Marketing","Photoshop","Excel","Figma","Google Ads","Facebook Ads")),
        Map.entry("KE_TOAN",     List.of("Excel","SQL","Power BI","SAP","MISA","QuickBooks")),
        Map.entry("NHAN_SU",     List.of("Excel","Marketing","HRIS","Workday","SAP HR")),
        Map.entry("CHAM_SOC_KH", List.of("Excel","CRM","Salesforce","Zendesk","Freshdesk")),
        Map.entry("XAY_DUNG",    List.of("AutoCAD","Revit","Excel","SAP","MS Project")),
        Map.entry("GIAO_DUC",    List.of("Excel","PowerPoint","Zoom","LMS","Canva")),
        Map.entry("Y_TE",        List.of("Excel","PACS","HIS","LIS","Word")),
        Map.entry("LAO_DONG_PT", List.of("Excel","Forklift")),
        Map.entry("THIET_KE",    List.of("Figma","Photoshop","Illustrator","After Effects","Premiere")),
        Map.entry("VAN_TAI",     List.of("Excel","SAP","WMS","TMS","SQL"))
    );

    // ── Companies ─────────────────────────────────────────
    private static final String[][] COMPANIES = {
        {"FPT Software","CNTT","Hà Nội","Công ty phần mềm hàng đầu Việt Nam với hơn 30.000 nhân viên, chuyên cung cấp dịch vụ IT outsourcing cho khách hàng toàn cầu.","500_PLUS"},
        {"VNG Corporation","CNTT","Hồ Chí Minh","Tập đoàn công nghệ hàng đầu Việt Nam sở hữu Zalo và ZaloPay.","500_PLUS"},
        {"Tiki","KINH_DOANH","Hồ Chí Minh","Nền tảng thương mại điện tử hàng đầu với cam kết giao hàng trong 2 giờ.","201_500"},
        {"Momo","CNTT","Hồ Chí Minh","Ví điện tử số 1 Việt Nam với hơn 31 triệu người dùng.","201_500"},
        {"Vingroup","XAY_DUNG","Hà Nội","Tập đoàn kinh tế tư nhân lớn nhất Việt Nam hoạt động đa lĩnh vực.","500_PLUS"},
        {"Techcombank","KE_TOAN","Hà Nội","Ngân hàng thương mại cổ phần hàng đầu với hơn 11 triệu khách hàng.","500_PLUS"},
        {"Viettel Digital","CNTT","Hà Nội","Công ty chuyển đổi số của Tập đoàn Viettel.","201_500"},
        {"KiotViet","CNTT","Hồ Chí Minh","Nền tảng quản lý bán hàng số 1 Việt Nam phục vụ 200.000+ cửa hàng.","51_200"},
        {"Shopee Vietnam","KINH_DOANH","Hồ Chí Minh","Nền tảng thương mại điện tử hàng đầu Đông Nam Á.","500_PLUS"},
        {"VNPAY","CNTT","Hà Nội","Công ty cung cấp giải pháp thanh toán điện tử hàng đầu Việt Nam.","201_500"},
        {"NashTech","CNTT","Hà Nội","Công ty dịch vụ IT toàn cầu với 2000+ kỹ sư.","500_PLUS"},
        {"Grab Vietnam","VAN_TAI","Hồ Chí Minh","Siêu ứng dụng hàng đầu Đông Nam Á về vận tải và giao đồ ăn.","201_500"},
        {"OneMount Group","CNTT","Hà Nội","Tập đoàn công nghệ sở hữu VinShop và VinID.","201_500"},
        {"TMA Solutions","CNTT","Hồ Chí Minh","Công ty outsourcing phần mềm 4000+ kỹ sư.","500_PLUS"},
        {"Hoa Sen Group","XAY_DUNG","Hồ Chí Minh","Tập đoàn sản xuất và kinh doanh thép lớn nhất Việt Nam.","500_PLUS"},
        {"Vinamilk","KINH_DOANH","Hồ Chí Minh","Công ty sữa hàng đầu Việt Nam với thị phần trên 50% thị trường.","500_PLUS"},
        {"Sun Group","XAY_DUNG","Hà Nội","Tập đoàn đầu tư phát triển bất động sản nghỉ dưỡng cao cấp.","201_500"},
        {"Vinhomes","XAY_DUNG","Hà Nội","Công ty bất động sản nhà ở lớn nhất Việt Nam thuộc Vingroup.","500_PLUS"},
        {"Bidv","KE_TOAN","Hà Nội","Ngân hàng thương mại lớn nhất Việt Nam xét về tổng tài sản.","500_PLUS"},
        {"VPBank","KE_TOAN","Hà Nội","Ngân hàng TMCP Việt Nam Thịnh vượng với 1,5 triệu khách hàng doanh nghiệp.","500_PLUS"},
        {"Masan Group","KINH_DOANH","Hồ Chí Minh","Tập đoàn tiêu dùng - bán lẻ hàng đầu sở hữu WinMart và Masan Consumer.","500_PLUS"},
        {"Nexon Vietnam","CNTT","Hồ Chí Minh","Công ty phát triển game online hàng đầu khu vực Đông Nam Á.","201_500"},
        {"Elcom","CNTT","Hà Nội","Tập đoàn công nghệ thông tin tham gia nhiều lĩnh vực công nghệ số.","51_200"},
        {"Rikkeisoft","CNTT","Hà Nội","Công ty phần mềm Việt - Nhật với hơn 3000 kỹ sư công nghệ.","201_500"},
        {"Logivan","VAN_TAI","Hồ Chí Minh","Công ty công nghệ vận tải kết nối chủ hàng và đội xe tải trên toàn quốc.","51_200"},
    };

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        long jobCount = jobRepository.count();
        if (jobCount >= TARGET_JOBS) {
            log.info("[Seed] Đã có {} jobs — bỏ qua seed", jobCount);
            return;
        }
        log.info("[Seed] Bắt đầu tạo dữ liệu mẫu lớn...");

        List<Skill> skills      = seedSkills();
        List<User> recruiters   = seedCompaniesAndRecruiters();
        seedAllJobs(recruiters, skills);
        List<User> candidates   = seedCandidates();
        seedApplications(candidates);

        log.info("[Seed] Hoàn thành! {} jobs, {} ứng viên", jobRepository.count(), candidateProfileRepository.count());
    }

    // ── Skills ────────────────────────────────────────────
    private List<Skill> seedSkills() {
        String[][] defs = {
            {"Java","Backend"},{"Spring Boot","Backend"},{"Python","Backend"},{"Node.js","Backend"},
            {"Go","Backend"},{"PHP","Backend"},{"React","Frontend"},{"Vue.js","Frontend"},
            {"TypeScript","Frontend"},{"Next.js","Frontend"},{"Angular","Frontend"},
            {"PostgreSQL","Database"},{"MySQL","Database"},{"MongoDB","Database"},{"Redis","Database"},
            {"Docker","DevOps"},{"Kubernetes","DevOps"},{"AWS","Cloud"},{"Azure","Cloud"},
            {"Git","Tool"},{"SQL","Database"},{"Figma","Design"},{"Photoshop","Design"},
            {"Illustrator","Design"},{"After Effects","Design"},{"Premiere","Design"},
            {"Excel","Office"},{"PowerPoint","Office"},{"Power BI","Analytics"},
            {"Marketing","Business"},{"SEO","Marketing"},{"Google Ads","Marketing"},
            {"Facebook Ads","Marketing"},{"AutoCAD","Engineering"},{"Revit","Engineering"},
            {"SAP","ERP"},{"MISA","Accounting"},{"CRM","Business"},{"Salesforce","CRM"},
            {"Forklift","Logistics"},{"WMS","Logistics"},{"TMS","Logistics"},
        };
        List<Skill> result = new ArrayList<>();
        for (String[] d : defs) {
            Skill s = skillRepository.findByNameIgnoreCase(d[0]).orElseGet(() ->
                skillRepository.save(Skill.builder().name(d[0]).category(d[1]).build()));
            result.add(s);
        }
        log.info("[Seed] {} skills", result.size());
        return result;
    }

    // ── Companies + Recruiters ────────────────────────────
    private List<User> seedCompaniesAndRecruiters() {
        String encodedPw = passwordEncoder.encode(DEMO_PASSWORD);
        List<User> recruiters = new ArrayList<>();

        for (int i = 0; i < COMPANIES.length; i++) {
            String[] co = COMPANIES[i];
            String slug = toSlug(co[0]) + "-" + (i + 1);

            Company company = companyRepository.findBySlug(slug).orElseGet(() ->
                companyRepository.save(Company.builder()
                    .name(co[0]).slug(slug).industry(co[1]).city(co[2])
                    .description(co[3]).companySize(co[4]).isVerified(true).build()));

            String email = "recruiter" + (i + 1) + "@" + toSlug(co[0]) + ".vn";
            User recruiter = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                    .email(email).passwordHash(encodedPw)
                    .fullName("HR " + co[0]).role(Role.RECRUITER)
                    .phone("09" + String.format("%08d", rnd.nextInt(100000000)))
                    .isVerified(true).isActive(true).build()));

            if (!recruiterProfileRepository.existsByUserId(recruiter.getId())) {
                recruiterProfileRepository.save(RecruiterProfile.builder()
                    .user(recruiter).company(company)
                    .position("Trưởng phòng Tuyển dụng").isVerified(true).build());
            }
            recruiters.add(recruiter);
        }
        log.info("[Seed] {} recruiters/companies", recruiters.size());
        return recruiters;
    }

    // ── Jobs: ~50 per industry ────────────────────────────
    private void seedAllJobs(List<User> recruiters, List<Skill> allSkills) {
        String[] cities = {"Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Bình Dương","Cần Thơ","Đồng Nai"};
        int totalCreated = 0;

        // Build recruiter + company lookup
        List<RecruiterProfile> rps = new ArrayList<>();
        for (User r : recruiters) {
            recruiterProfileRepository.findByUserId(r.getId()).ifPresent(rps::add);
        }

        for (Map.Entry<String, List<String[]>> entry : INDUSTRY_JOBS.entrySet()) {
            String industry = entry.getKey();
            List<String[]> templates = entry.getValue();
            List<Skill> indSkills = getSkillsFor(allSkills, industry);
            int created = 0;

            for (String[] t : templates) {
                String title    = t[0];
                String levelStr = t[1];
                String typeStr  = t[2];

                // Pick a random recruiter/company
                RecruiterProfile rp = rps.get(rnd.nextInt(rps.size()));
                String city = cities[rnd.nextInt(cities.length)];
                String slug = toSlug(title) + "-" + toSlug(industry) + "-" + totalCreated;

                if (jobRepository.existsBySlug(slug)) { totalCreated++; continue; }

                long salMin = salaryMin(levelStr);
                long salMax = salMin + salaryRange(levelStr);

                Job job = jobRepository.save(Job.builder()
                    .company(rp.getCompany()).recruiter(rp.getUser())
                    .title(title).slug(slug)
                    .description(buildDescription(title, industry, rp.getCompany().getName()))
                    .requirements(buildRequirements(levelStr, title))
                    .benefits(buildBenefits(salMax, rp.getCompany().getName()))
                    .jobType(JobType.valueOf(typeStr))
                    .level(JobLevel.valueOf(levelStr))
                    .industry(industry).city(city)
                    .salaryMin(salMin).salaryMax(salMax)
                    .isSalaryPublic(rnd.nextBoolean())
                    .status(JobStatus.ACTIVE)
                    .publishedAt(LocalDateTime.now().minusDays(rnd.nextInt(30)))
                    .deadline(LocalDate.now().plusDays(30 + rnd.nextInt(60)))
                    .applyCount(rnd.nextInt(50)).viewCount(rnd.nextInt(1000))
                    .build());

                jobCriteriaRepository.save(JobCriteria.builder()
                    .job(job).skillWeight(35 + rnd.nextInt(20))
                    .experienceWeight(30 + rnd.nextInt(15))
                    .educationWeight(15 + rnd.nextInt(15))
                    .passThreshold(0.60 + rnd.nextDouble() * 0.20).build());

                List<Skill> picked = pickN(indSkills, 3 + rnd.nextInt(3));
                for (int si = 0; si < picked.size(); si++) {
                    job.getJobSkills().add(JobSkill.builder()
                        .job(job).skill(picked.get(si))
                        .isRequired(si < 2).level(si == 0 ? "ADVANCED" : "INTERMEDIATE").build());
                }
                jobRepository.save(job);
                created++; totalCreated++;
            }
            log.info("[Seed]  {} → {} jobs", industry, created);
        }
        log.info("[Seed] Tổng {} jobs", totalCreated);
    }

    // ── Candidates ────────────────────────────────────────
    private List<User> seedCandidates() {
        String[] firstNames = {"Nguyễn","Trần","Lê","Phạm","Hoàng","Vũ","Đặng","Bùi","Đỗ","Hồ","Dương","Võ"};
        String[] midNames   = {"Văn","Thị","Đình","Xuân","Minh","Thanh","Hữu","Quang","Thành","Anh","Ngọc","Kim"};
        String[] lastNames  = {"An","Bình","Chi","Dũng","Em","Giang","Hà","Hùng","Lan","Mai",
                               "Nam","Oanh","Phong","Quân","Sang","Thảo","Uyên","Vân","Xuân","Yến",
                               "Hoa","Long","Tuấn","Linh","Trang","Phúc","Hải","Cường","Hiền","Lâm"};
        String[] headlines  = {
            "Backend Developer 3 năm kinh nghiệm","Frontend React Developer","Kế toán tổng hợp CPA",
            "Digital Marketing chuyên SEO/SEM","Chuyên viên nhân sự 5 năm","Full Stack Developer",
            "Data Analyst Power BI & Python","Nhân viên CSKH năng động","Kỹ sư Java Spring Boot",
            "Product Designer UI/UX Figma","Nhân viên kinh doanh B2B","Logistics Coordinator",
            "Kỹ sư xây dựng dân dụng","Giảng viên CNTT","Dược sĩ lâm sàng",
        };
        String[] cities = {"Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Bình Dương"};

        String encodedPw = passwordEncoder.encode(DEMO_PASSWORD);
        List<User> candidates = new ArrayList<>();

        for (int i = 0; i < 80; i++) {
            final int idx = i;
            String email = "candidate" + (idx + 1) + "@demo.vn";
            User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                    .email(email).passwordHash(encodedPw)
                    .fullName(firstNames[rnd.nextInt(firstNames.length)] + " "
                            + midNames[rnd.nextInt(midNames.length)] + " "
                            + lastNames[rnd.nextInt(lastNames.length)])
                    .role(Role.CANDIDATE)
                    .phone("09" + String.format("%08d", rnd.nextInt(100000000)))
                    .isVerified(true).isActive(true).build()));

            CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                    .user(user)
                    .headline(headlines[rnd.nextInt(headlines.length)])
                    .yearsOfExperience(rnd.nextInt(8))
                    .city(cities[rnd.nextInt(cities.length)])
                    .bio("Tôi đang tìm kiếm cơ hội mới phù hợp với kinh nghiệm và định hướng phát triển.")
                    .profileCompleteness(60 + rnd.nextInt(40))
                    .build()));

            CvFile cv = cvFileRepository.findByCandidateIdAndIsPrimaryTrue(profile.getId())
                .orElseGet(() -> {
                    CvFile f = cvFileRepository.save(CvFile.builder()
                        .candidate(profile)
                        .fileUrl("http://localhost:9000/recruitment/cv/seed/cv-demo-" + (idx % 5) + ".pdf")
                        .fileName("CV_" + user.getFullName().replace(" ", "_") + ".pdf")
                        .fileType("PDF").fileSizeKb(200 + rnd.nextInt(300)).isPrimary(true).build());
                    cvParseResultRepository.save(CvParseResult.builder()
                        .cvFile(f).candidate(profile)
                        .rawText(profile.getHeadline() + " " + profile.getCity() + " " + user.getFullName())
                        .parseConfidence(0.8).aiModelUsed("seed").build());
                    return f;
                });

            candidates.add(user);
        }
        log.info("[Seed] {} ứng viên", candidates.size());
        return candidates;
    }

    // ── Applications ──────────────────────────────────────
    private void seedApplications(List<User> candidates) {
        List<Job> jobs = jobRepository.findAll();
        if (jobs.isEmpty()) return;
        ApplicationStatus[] statuses = {
            ApplicationStatus.SUBMITTED, ApplicationStatus.SUBMITTED, ApplicationStatus.SUBMITTED,
            ApplicationStatus.REVIEWING, ApplicationStatus.REVIEWING,
            ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEWING,
            ApplicationStatus.OFFERED, ApplicationStatus.REJECTED,
        };
        int count = 0;
        for (User cand : candidates) {
            CandidateProfile prof = candidateProfileRepository.findByUserId(cand.getId()).orElse(null);
            if (prof == null) continue;
            CvFile cv = cvFileRepository.findByCandidateIdAndIsPrimaryTrue(prof.getId()).orElse(null);
            if (cv == null) continue;

            List<Job> shuffled = new ArrayList<>(jobs);
            Collections.shuffle(shuffled, rnd);
            int num = 2 + rnd.nextInt(5);
            for (int j = 0; j < Math.min(num, shuffled.size()); j++) {
                Job job = shuffled.get(j);
                if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), cand.getId())) continue;
                ApplicationStatus st = statuses[rnd.nextInt(statuses.length)];
                applicationRepository.save(Application.builder()
                    .job(job).candidate(cand).cvFile(cv)
                    .coverLetter("Kính gửi Quý công ty, tôi xin ứng tuyển vào vị trí " + job.getTitle() + ".")
                    .status(st)
                    .aiMatchScore(st != ApplicationStatus.SUBMITTED ? 0.45 + rnd.nextDouble() * 0.55 : null)
                    .passedThreshold(st == ApplicationStatus.SHORTLISTED || st == ApplicationStatus.INTERVIEWING
                        || st == ApplicationStatus.OFFERED ? true : null)
                    .build());
                count++;
            }
        }
        log.info("[Seed] {} đơn ứng tuyển", count);
    }

    // ── Helpers ───────────────────────────────────────────
    private List<Skill> getSkillsFor(List<Skill> all, String industry) {
        List<String> names = INDUSTRY_SKILLS.getOrDefault(industry, List.of("Excel","SQL"));
        List<Skill> result = new ArrayList<>();
        for (Skill s : all) { if (names.contains(s.getName())) result.add(s); }
        if (result.isEmpty()) result.addAll(all.subList(0, Math.min(5, all.size())));
        return result;
    }

    private List<Skill> pickN(List<Skill> src, int n) {
        List<Skill> shuffled = new ArrayList<>(src);
        Collections.shuffle(shuffled, rnd);
        return shuffled.subList(0, Math.min(n, shuffled.size()));
    }

    private long salaryMin(String level) {
        return switch (level) {
            case "INTERN"  -> 2_000_000L + rnd.nextInt(3) * 500_000L;
            case "JUNIOR"  -> 7_000_000L + rnd.nextInt(5) * 1_000_000L;
            case "MID"     -> 15_000_000L + rnd.nextInt(10) * 1_000_000L;
            case "SENIOR"  -> 25_000_000L + rnd.nextInt(15) * 1_000_000L;
            case "LEAD"    -> 35_000_000L + rnd.nextInt(15) * 1_000_000L;
            case "MANAGER" -> 50_000_000L + rnd.nextInt(30) * 1_000_000L;
            default        -> 15_000_000L;
        };
    }

    private long salaryRange(String level) {
        return switch (level) {
            case "INTERN"  -> 1_000_000L;
            case "JUNIOR"  -> 3_000_000L + rnd.nextInt(3) * 500_000L;
            case "MID"     -> 5_000_000L + rnd.nextInt(5) * 1_000_000L;
            case "SENIOR"  -> 10_000_000L + rnd.nextInt(10) * 1_000_000L;
            case "LEAD"    -> 15_000_000L + rnd.nextInt(10) * 1_000_000L;
            case "MANAGER" -> 30_000_000L + rnd.nextInt(20) * 1_000_000L;
            default        -> 5_000_000L;
        };
    }

    private String buildDescription(String title, String industry, String company) {
        String[][] industryDesc = {
            {"CNTT", "phần mềm và công nghệ", "triển khai các hệ thống kỹ thuật", "sản phẩm công nghệ"},
            {"KINH_DOANH", "kinh doanh và bán hàng", "phát triển doanh thu", "mục tiêu doanh số"},
            {"MARKETING", "marketing và truyền thông", "xây dựng thương hiệu", "chiến dịch tiếp thị"},
            {"KE_TOAN", "tài chính kế toán", "quản lý sổ sách và báo cáo tài chính", "cân đối tài chính"},
            {"NHAN_SU", "nhân sự và phát triển tổ chức", "quản lý nguồn nhân lực", "văn hóa doanh nghiệp"},
            {"CHAM_SOC_KH", "dịch vụ khách hàng", "nâng cao trải nghiệm khách hàng", "sự hài lòng của khách hàng"},
            {"XAY_DUNG", "xây dựng và bất động sản", "thi công và giám sát công trình", "dự án xây dựng"},
            {"GIAO_DUC", "giáo dục và đào tạo", "phát triển chương trình học", "chất lượng giảng dạy"},
            {"Y_TE", "y tế và dược phẩm", "chăm sóc sức khỏe cộng đồng", "dịch vụ y tế"},
            {"LAO_DONG_PT", "sản xuất và vận hành", "đảm bảo quy trình sản xuất", "hiệu suất làm việc"},
            {"THIET_KE", "thiết kế sáng tạo", "tạo ra các sản phẩm thiết kế", "trải nghiệm người dùng"},
            {"VAN_TAI", "vận tải và logistics", "tối ưu chuỗi cung ứng", "giao nhận hàng hóa"},
        };
        String field = "lĩnh vực liên quan", task = "thực hiện nhiệm vụ chuyên môn", output = "kết quả công việc";
        for (String[] d : industryDesc) {
            if (d[0].equals(industry)) { field = d[1]; task = d[2]; output = d[3]; break; }
        }
        return String.format("""
## Mô tả công việc

**%s** tại **%s** đang tìm kiếm ứng viên tài năng trong lĩnh vực **%s**.

**Nhiệm vụ chính:**
- Trực tiếp tham gia vào việc %s của công ty
- Phối hợp với các phòng ban liên quan để đảm bảo %s đạt chất lượng cao nhất
- Báo cáo tiến độ và kết quả công việc định kỳ cho quản lý trực tiếp
- Đề xuất các giải pháp cải tiến quy trình và nâng cao hiệu quả công việc
- Tham gia vào các dự án và sáng kiến của công ty theo phân công

**Môi trường làm việc:**
- Văn phòng hiện đại, trang thiết bị đầy đủ
- Đội ngũ chuyên nghiệp, năng động và thân thiện
- Cơ hội làm việc với các dự án quy mô lớn, tầm quốc tế
""", title, company, field, task, output);
    }

    private String buildRequirements(String level, String title) {
        String expLine = switch (level) {
            case "INTERN"  -> "Đang theo học hoặc mới tốt nghiệp chuyên ngành liên quan";
            case "JUNIOR"  -> "Tối thiểu 1 năm kinh nghiệm liên quan";
            case "MID"     -> "Tối thiểu 3 năm kinh nghiệm trong lĩnh vực tương tự";
            case "SENIOR"  -> "Tối thiểu 5 năm kinh nghiệm, có kinh nghiệm dự án thực tế";
            case "LEAD"    -> "Tối thiểu 7 năm kinh nghiệm, có kinh nghiệm dẫn dắt team";
            case "MANAGER" -> "Tối thiểu 10 năm kinh nghiệm, đã từng quản lý team 5+ người";
            default        -> "Có kinh nghiệm phù hợp với vị trí";
        };
        return String.format("""
## Yêu cầu ứng viên

- **Kinh nghiệm**: %s
- Tốt nghiệp Đại học chuyên ngành liên quan (loại Khá trở lên ưu tiên)
- Có kiến thức chuyên môn vững chắc về %s
- Kỹ năng giao tiếp tốt bằng tiếng Việt; tiếng Anh là lợi thế
- Có khả năng làm việc độc lập và phối hợp nhóm hiệu quả
- Chủ động, trách nhiệm và có khả năng chịu áp lực công việc
- Có tư duy sáng tạo và định hướng kết quả
""", expLine, title);
    }

    private String buildBenefits(long salMax, String company) {
        long bonus = salMax / 12;
        return String.format("""
## Quyền lợi

- **Lương**: Cạnh tranh, review lương 2 lần/năm theo hiệu suất
- **Thưởng**: Thưởng KPI hàng quý + thưởng Tết (tương đương %s tháng lương)
- **Bảo hiểm**: BHXH, BHYT, BHTN đầy đủ + bảo hiểm sức khỏe cao cấp PVI/Bảo Việt
- **Nghỉ phép**: 12-15 ngày phép năm + nghỉ lễ theo quy định nhà nước
- **Đào tạo**: Budget đào tạo cá nhân, hỗ trợ thi chứng chỉ chuyên môn
- **Phúc lợi khác**: Ăn trưa/cà phê miễn phí, team building hàng quý, happy hour hàng tuần
- **Môi trường**: Văn phòng %s hiện đại, trang thiết bị tốt, không khí làm việc thoải mái
- **Cơ hội thăng tiến**: Lộ trình phát triển rõ ràng với từng vị trí
""", Math.max(1, (int)(bonus / 1_000_000L)), company);
    }

    private String toSlug(String text) {
        return text.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("đ", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
