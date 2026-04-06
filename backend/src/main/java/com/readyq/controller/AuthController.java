package com.readyq.controller;

import com.readyq.dto.*;
import com.readyq.service.AuthService;
import com.readyq.service.EmailService;
import com.readyq.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;
    private final EmailService emailService;

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        log.info("[AUTH] POST /login | username={}", req.getUsername());
        return ResponseEntity.ok(authService.login(req));
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@Valid @RequestBody SignUpRequest req) {
        log.info("[AUTH] POST /signup | username={}, email={}", req.getUsername(), req.getEmail());
        authService.signUp(req);
        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다"));
    }

    // SMS 인증코드 발송 (회원가입 전화번호 인증용)
    @PostMapping("/sms/send")
    public ResponseEntity<Map<String, String>> sendSms(@Valid @RequestBody SmsRequest req) {
        log.info("[AUTH] POST /sms/send | phone={}", req.getPhone());
        smsService.sendCode(req.getPhone());
        return ResponseEntity.ok(Map.of("message", "인증코드가 발송되었습니다"));
    }

    // SMS 인증코드 확인
    @PostMapping("/sms/verify")
    public ResponseEntity<Map<String, Object>> verifySms(@Valid @RequestBody SmsVerifyRequest req) {
        log.info("[AUTH] POST /sms/verify | phone={}, code={}", req.getPhone(), req.getCode());
        boolean verified = smsService.verifyCode(req.getPhone(), req.getCode());
        if (!verified) {
            log.info("[AUTH] SMS 인증 실패 | phone={}", req.getPhone());
            return ResponseEntity.badRequest()
                    .body(Map.of("verified", false, "message", "인증코드가 올바르지 않거나 만료되었습니다"));
        }
        log.info("[AUTH] SMS 인증 성공 | phone={}", req.getPhone());
        return ResponseEntity.ok(Map.of("verified", true, "message", "인증이 완료되었습니다"));
    }

    // 이메일 인증코드 발송 (아이디 찾기 / 비밀번호 찾기용)
    @PostMapping("/email/send")
    public ResponseEntity<Map<String, String>> sendEmail(@Valid @RequestBody EmailRequest req) {
        log.info("[AUTH] POST /email/send | email={}", req.getEmail());
        emailService.sendCode(req.getEmail());
        return ResponseEntity.ok(Map.of("message", "인증코드가 발송되었습니다"));
    }

    // 아이디 찾기: 이메일 OTP 인증 후 아이디 반환
    @PostMapping("/find-username")
    public ResponseEntity<Map<String, String>> findUsername(@Valid @RequestBody FindUsernameRequest req) {
        boolean verified = emailService.verifyCode(req.getEmail(), req.getCode());
        if (!verified) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "인증코드가 올바르지 않거나 만료되었습니다"));
        }
        String username = authService.findUsernameByEmail(req.getEmail());
        return ResponseEntity.ok(Map.of("username", username));
    }

    // 비밀번호 찾기 - 본인 인증: username + 이메일 OTP 검증 후 reset token 발급
    @PostMapping("/find-password/verify")
    public ResponseEntity<Map<String, String>> verifyForPasswordReset(
            @Valid @RequestBody FindPasswordVerifyRequest req) {
        authService.validateUserForPasswordReset(req.getUsername(), req.getEmail());
        boolean verified = emailService.verifyCode(req.getEmail(), req.getCode());
        if (!verified) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "인증코드가 올바르지 않거나 만료되었습니다"));
        }
        String resetToken = emailService.issueResetToken(req.getEmail());
        return ResponseEntity.ok(Map.of("resetToken", resetToken));
    }

    // 비밀번호 재설정: reset token으로 새 비밀번호 저장
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        String email = emailService.validateAndConsumeResetToken(req.getResetToken());
        authService.resetPasswordByEmail(email, req.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다"));
    }

    // 소셜 로그인 테스트용
    @GetMapping("/test")
    public ResponseEntity<String> testAuth() {
        return ResponseEntity.ok("토큰 인증 성공.");
    }
}
