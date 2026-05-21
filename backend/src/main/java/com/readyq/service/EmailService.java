package com.readyq.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class EmailService {

    @Value("${email.mock:true}")
    private boolean mockMode;

    private static final int OTP_EXPIRE_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRE_MINUTES = 10;

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final Map<String, ResetTokenEntry> resetTokenStore = new ConcurrentHashMap<>();

    public void sendCode(String email) {
        String code = generateCode();
        otpStore.put(email, new OtpEntry(code, LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES)));

        if (mockMode) {
            log.info("[이메일 인증] 수신주소: {} | 인증코드: {} ({}분 유효)", email, code, OTP_EXPIRE_MINUTES);
        } else {
            // 실제 이메일 발송 (Spring Mail 연동 필요)
            throw new UnsupportedOperationException("이메일 발송 서비스를 설정해주세요 (application.yml)");
        }
    }

    public boolean verifyCode(String email, String inputCode) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            return false;
        }
        boolean matched = entry.code().equals(inputCode);
        if (matched) otpStore.remove(email);
        return matched;
    }

    public String issueResetToken(String email) {
        String token = UUID.randomUUID().toString();
        resetTokenStore.put(token, new ResetTokenEntry(email, LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRE_MINUTES)));
        return token;
    }

    public String validateAndConsumeResetToken(String token) {
        ResetTokenEntry entry = resetTokenStore.get(token);
        if (entry == null) {
            throw new IllegalArgumentException("유효하지 않은 재설정 토큰입니다");
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            resetTokenStore.remove(token);
            throw new IllegalArgumentException("재설정 토큰이 만료되었습니다. 다시 인증해주세요");
        }
        resetTokenStore.remove(token);
        return entry.email();
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1_000_000));
    }

    private record OtpEntry(String code, LocalDateTime expiresAt) {}
    private record ResetTokenEntry(String email, LocalDateTime expiresAt) {}
}
