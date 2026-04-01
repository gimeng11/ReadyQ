package com.readyq.controller;

import com.readyq.dto.LoginRequest;
import com.readyq.dto.LoginResponse;
import com.readyq.dto.SignUpRequest;
import com.readyq.dto.SmsRequest;
import com.readyq.dto.SmsVerifyRequest;
import com.readyq.service.AuthService;
import com.readyq.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@Valid @RequestBody SignUpRequest req) {
        authService.signUp(req);
        return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다"));
    }

    // 인증코드 발송
    @PostMapping("/sms/send")
    public ResponseEntity<Map<String, String>> sendSms(@Valid @RequestBody SmsRequest req) {
        smsService.sendCode(req.getPhone());
        return ResponseEntity.ok(Map.of("message", "인증코드가 발송되었습니다"));
    }

    // 인증코드 확인
    @PostMapping("/sms/verify")
    public ResponseEntity<Map<String, Object>> verifySms(@Valid @RequestBody SmsVerifyRequest req) {
        boolean verified = smsService.verifyCode(req.getPhone(), req.getCode());
        if (!verified) {
            return ResponseEntity.badRequest()
                    .body(Map.of("verified", false, "message", "인증코드가 올바르지 않거나 만료되었습니다"));
        }
        return ResponseEntity.ok(Map.of("verified", true, "message", "인증이 완료되었습니다"));
    }

    // 아이디 찾기 (이메일 또는 전화번호)
    @GetMapping("/find-username")
    public ResponseEntity<Map<String, String>> findUsername(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone
    ) {
        String username = authService.findUsername(email, phone);
        return ResponseEntity.ok(Map.of("username", username));
    }

    // 비밀번호 재설정
    @PostMapping("/find-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body
    ) {
        authService.resetPassword(body.get("username"), body.get("phone"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다"));
    }
}
