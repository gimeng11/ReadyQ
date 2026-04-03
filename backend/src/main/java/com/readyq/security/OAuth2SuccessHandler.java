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
        // 1. 인증된 유저 정보 가져오기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // CustomOAuth2UserService에서 만든 방식과 동일하게 username 조합
        String providerId = oAuth2User.getAttribute("sub");
        String username = "google_" + providerId;

        // 2. JWT 토큰 생성
        String token = jwtUtil.generateToken(username, "USER");

        // 3. 프론트엔드 주소로 리다이렉트 (토큰을 URL 파라미터로 붙여서 전달)
        // 프론트엔드가 3000포트를 쓴다고 가정한 주소야. 나중에 프론트 주소로 바꿔야 해.
        String redirectUrl = "http://localhost:3000/oauth2/redirect?token=" + token;

        response.sendRedirect(redirectUrl);
    }
}