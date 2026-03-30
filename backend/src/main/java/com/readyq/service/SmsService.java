package com.readyq.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SmsService {

    @Value("${sms.mock:true}")
    private boolean mockMode;

    // phone -> (code, 만료시각)
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRE_MINUTES = 5;

    public void sendCode(String phone) {
        String code = generateCode();
        otpStore.put(phone, new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES)));

        if (mockMode) {
            // 개발 환경: 실제 발송 없이 로그 출력
            log.info("[SMS 인증] 수신번호: {} | 인증코드: {} ({}분 유효)", phone, code, OTP_EXPIRE_MINUTES);
        } else {
            // 실제 SMS 발송 (NCP SENS / Twilio 등 연동)
            // sendViaNcp(phone, code);
            throw new UnsupportedOperationException("SMS 제공업체를 설정해주세요 (application.yml)");
        }
    }

    public boolean verifyCode(String phone, String inputCode) {
        OtpEntry entry = otpStore.get(phone);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(phone);
            return false;
        }
        boolean matched = entry.code().equals(inputCode);
        if (matched) otpStore.remove(phone);
        return matched;
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1_000_000));
    }

    private record OtpEntry(String code, LocalDateTime expiresAt) {}
}
