package com.readyq.service;

import com.readyq.dto.LoginRequest;
import com.readyq.dto.LoginResponse;
import com.readyq.dto.SignUpRequest;
import com.readyq.model.User;
import com.readyq.repository.UserRepository;
import com.readyq.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getUsername(), user.getNickname(), user.getRole());
    }

    public void signUp(SignUpRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다");
        }
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("이미 사용 중인 전화번호입니다");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickname(req.getNickname());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());

        userRepository.save(user);
    }

    // 아이디 찾기: 이메일 OTP 인증 완료 후 호출
    public String findUsernameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUsername)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 계정이 없습니다"));
    }

    // 비밀번호 재설정 본인확인: username + email이 일치하는지 검증
    public void validateUserForPasswordReset(String username, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다"));
        if (!user.getEmail().equals(email)) {
            throw new IllegalArgumentException("아이디와 이메일이 일치하지 않습니다");
        }
    }

    // 비밀번호 재설정: resetToken 검증 후 새 비밀번호 저장
    public void resetPasswordByEmail(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 계정이 없습니다"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
