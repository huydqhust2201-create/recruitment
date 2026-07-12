package com.example.be.service;

import com.example.be.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig config;

    public String createPaymentUrl(String txnRef, String planCode, long amount, String ipAddr) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan goi " + planCode + " RecruitAI");
        params.put("vnp_OrderType", "billpayment");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", ipAddr != null ? ipAddr : "127.0.0.1");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        params.put("vnp_CreateDate", now.format(fmt));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(fmt));

        // VNPay v2.1.0: cả hashData và query đều dùng URL-encoded values
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                hashData.append('&');
                query.append('&');
            }
            String encodedKey   = URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII);
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);
            hashData.append(encodedKey).append('=').append(encodedValue);
            query   .append(encodedKey).append('=').append(encodedValue);
            first = false;
        }

        String secureHash = hmacSHA512(config.getHashSecret(), hashData.toString());
        return config.getPayUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyResponse(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isEmpty()) return false;

        Map<String, String> filtered = new TreeMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : filtered.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (!first) hashData.append('&');
                hashData.append(URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                first = false;
            }
        }

        String computed = hmacSHA512(config.getHashSecret(), hashData.toString());
        return computed.equalsIgnoreCase(receivedHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA512 error", e);
        }
    }
}
