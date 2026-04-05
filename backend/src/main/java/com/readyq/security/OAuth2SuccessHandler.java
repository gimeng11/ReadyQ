package com.readyq.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 인증된 유저 정보 가져오기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String username = (String) authentication.getName();

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(username, "USER");

        // 3. 프론트엔드 주소로 리다이렉트
        // 로컬 ip 주소 expo go 테스트용 변경 필요
        String redirectUrl = "exp://192.168.55.77:8081/--/oauth2/redirect?token=" + token;

        response.sendRedirect(redirectUrl);
    }
}