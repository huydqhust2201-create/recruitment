package com.example.be.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@recruitment.vn}")
    private String fromAddress;

    @Async
    public void sendApplicationStatusChanged(String toEmail, String candidateName,
                                              String jobTitle, String companyName,
                                              String newStatus) {
        String subject = "[Recruitment AI] Cập nhật trạng thái đơn ứng tuyển";
        String statusVi = switch (newStatus) {
            case "REVIEWING"    -> "Đang được xem xét";
            case "SHORTLISTED"  -> "Vào vòng trong ✅";
            case "INTERVIEWING" -> "Mời phỏng vấn 🎉";
            case "OFFERED"      -> "Nhận được Offer 🎊";
            case "REJECTED"     -> "Không tiếp tục";
            case "WITHDRAWN"    -> "Đã rút đơn";
            default             -> newStatus;
        };

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#1a56db;padding:24px;border-radius:12px 12px 0 0">
                    <h1 style="color:white;margin:0;font-size:22px">Recruitment AI</h1>
                  </div>
                  <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                    <p style="color:#374151;font-size:15px">Xin chào <strong>%s</strong>,</p>
                    <p style="color:#374151">Đơn ứng tuyển của bạn cho vị trí <strong>%s</strong> tại <strong>%s</strong> đã được cập nhật:</p>
                    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
                      <p style="font-size:18px;font-weight:bold;color:#1a56db;margin:0">%s</p>
                    </div>
                    <p style="color:#6b7280;font-size:13px">Đăng nhập vào hệ thống để xem chi tiết và phản hồi kịp thời.</p>
                    <a href="http://localhost:3000/candidate/applications"
                       style="display:inline-block;background:#1a56db;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
                      Xem đơn ứng tuyển
                    </a>
                  </div>
                  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:16px">
                    Recruitment AI Platform — Email tự động, vui lòng không reply.
                  </p>
                </div>
                """.formatted(candidateName, jobTitle, companyName, statusVi);

        sendHtml(toEmail, subject, html);
    }

    @Async
    public void sendNewApplicationAlert(String toEmail, String recruiterName,
                                         String candidateName, String jobTitle) {
        String subject = "[Recruitment AI] Có ứng viên mới ứng tuyển";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#1a56db;padding:24px;border-radius:12px 12px 0 0">
                    <h1 style="color:white;margin:0;font-size:22px">Recruitment AI</h1>
                  </div>
                  <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                    <p style="color:#374151">Xin chào <strong>%s</strong>,</p>
                    <p style="color:#374151">Ứng viên <strong>%s</strong> vừa nộp đơn ứng tuyển vào vị trí <strong>%s</strong>.</p>
                    <a href="http://localhost:3000/recruiter/jobs"
                       style="display:inline-block;background:#1a56db;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
                      Xem hồ sơ ứng viên
                    </a>
                  </div>
                </div>
                """.formatted(recruiterName, candidateName, jobTitle);

        sendHtml(toEmail, subject, html);
    }

    @Async
    public void sendSubscriptionExpiring(String toEmail, String companyName, int daysLeft) {
        String subject = "[Recruitment AI] Gói dịch vụ sắp hết hạn";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <div style="background:#d97706;padding:24px;border-radius:12px 12px 0 0">
                    <h1 style="color:white;margin:0;font-size:22px">⚠️ Thông báo gia hạn</h1>
                  </div>
                  <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
                    <p style="color:#374151">Xin chào <strong>%s</strong>,</p>
                    <p style="color:#374151">Gói dịch vụ của bạn sẽ hết hạn sau <strong>%d ngày</strong>.</p>
                    <p style="color:#374151">Gia hạn ngay để không bị gián đoạn dịch vụ.</p>
                    <a href="http://localhost:3000/recruiter/subscription"
                       style="display:inline-block;background:#d97706;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">
                      Gia hạn ngay
                    </a>
                  </div>
                </div>
                """.formatted(companyName, daysLeft);

        sendHtml(toEmail, subject, html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
