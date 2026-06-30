package com.example.be.controller;

import com.example.be.entity.Company;
import com.example.be.entity.PaymentTransaction;
import com.example.be.entity.SubscriptionPlan;
import com.example.be.entity.enums.PlanCode;
import com.example.be.repository.CompanyRepository;
import com.example.be.repository.PaymentTransactionRepository;
import com.example.be.repository.RecruiterProfileRepository;
import com.example.be.repository.SubscriptionPlanRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.VNPayService;
import com.example.be.service.inf.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recruiter/payment")
public class PaymentController {

    private final VNPayService vnPayService;
    private final SubscriptionService subscriptionService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;

    /**
     * POST /api/recruiter/payment/create
     * Body: { "planCode": "BASIC" | "PRO" }
     * Returns: { "paymentUrl": "https://sandbox.vnpayment.vn/...", "txnRef": "PAYxxxxxxxx" }
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        UUID companyId = getCompanyId(userDetails);
        PlanCode planCode = PlanCode.valueOf(body.getOrDefault("planCode", "BASIC"));

        SubscriptionPlan plan = subscriptionPlanRepository.findByCode(planCode)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        String txnRef = "PAY" + System.currentTimeMillis();

        PaymentTransaction txn = PaymentTransaction.builder()
                .txnRef(txnRef)
                .company(company)
                .planCode(planCode.name())
                .amount(plan.getPriceMonthly())
                .status("PENDING")
                .build();
        paymentTransactionRepository.save(txn);

        String ipAddr = request.getHeader("X-Forwarded-For");
        if (ipAddr == null || ipAddr.isBlank()) {
            ipAddr = request.getRemoteAddr();
        }

        String paymentUrl = vnPayService.createPaymentUrl(
                txnRef, planCode.name(), plan.getPriceMonthly(), ipAddr);

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl, "txnRef", txnRef));
    }

    /**
     * GET /api/recruiter/payment/verify?vnp_TxnRef=...&vnp_ResponseCode=...&vnp_SecureHash=...&...
     * Called by frontend after VNPay redirects back.
     * Returns: { "success": true/false, "message": "..." }
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam Map<String, String> params,
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> result = new HashMap<>();

        if (!vnPayService.verifyResponse(params)) {
            result.put("success", false);
            result.put("message", "Chữ ký không hợp lệ");
            return ResponseEntity.ok(result);
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef       = params.get("vnp_TxnRef");
        String vnpTxnNo     = params.getOrDefault("vnp_TransactionNo", "");

        PaymentTransaction txn = paymentTransactionRepository.findByTxnRef(txnRef).orElse(null);
        if (txn == null) {
            result.put("success", false);
            result.put("message", "Không tìm thấy giao dịch");
            return ResponseEntity.ok(result);
        }

        // Idempotent: already processed
        if ("SUCCESS".equals(txn.getStatus())) {
            result.put("success", true);
            result.put("message", "Gói dịch vụ đã được kích hoạt trước đó");
            return ResponseEntity.ok(result);
        }

        if ("00".equals(responseCode)) {
            txn.setStatus("SUCCESS");
            txn.setVnpTransactionNo(vnpTxnNo);
            txn.setVnpResponseCode(responseCode);
            paymentTransactionRepository.save(txn);

            subscriptionService.subscribe(
                    txn.getCompany().getId(),
                    PlanCode.valueOf(txn.getPlanCode()),
                    "VNPAY-" + vnpTxnNo);

            result.put("success", true);
            result.put("message", "Thanh toán thành công! Gói đã được kích hoạt.");
        } else {
            txn.setStatus("FAILED");
            txn.setVnpResponseCode(responseCode);
            paymentTransactionRepository.save(txn);

            result.put("success", false);
            result.put("message", "Thanh toán thất bại (mã lỗi: " + responseCode + ")");
        }

        return ResponseEntity.ok(result);
    }

    private UUID getCompanyId(UserDetails userDetails) {
        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        return recruiterProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"))
                .getCompany().getId();
    }
}
