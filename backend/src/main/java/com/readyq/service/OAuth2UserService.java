package com.readyq.service;

import com.readyq.model.User;
import com.readyq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google", "naver", "kakao"

        String providerId = null;
        String email = null;
        String name = null;

        // 구글
        if (provider.equals("google")) {
            providerId = oAuth2User.getAttribute("sub");
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
        } else if (provider.equals("naver")) {
            // 네이버
            Map<String, Object> response = (Map<String, Object>) oAuth2User.getAttributes().get("response");
            providerId = (String) response.get("id");
            email = (String) response.get("email");
            name = (String) response.get("name");
        } else if (provider.equals("kakao")) {
            // 카카오
            providerId = String.valueOf(oAuth2User.getAttributes().get("id"));

            Map<String, Object> kakaoAccount = (Map<String, Object>) oAuth2User.getAttributes().get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            email = (String) kakaoAccount.get("email");
            name = (String) profile.get("nickname");
        }

        // provider + providerId  DB에 해당 플랫폼과 고유 식별자로 가입된 유저가 있는지 확인
        String username = provider + "_" + providerId;
        User user = userRepository.findByUsername(username).orElse(null);

        // DB에 없으면 자동 회원가입 처리
        if (user == null) {
            user = new User();
            user.setUsername(username); // 자동 아이디 생성
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // 임의의 비밀번호
            user.setEmail(email);
            user.setNickname(name);
            user.setProvider(provider);
            user.setProviderId(providerId);
            userRepository.save(user);
        }

        // 기존 oAuth2User의 속성들을 복사할 수 있는 Map 생성
        Map<String, Object> customAttributes = new java.util.HashMap<>(oAuth2User.getAttributes());

        // 고유 식별자(username)를 Map에 추가
        customAttributes.put("custom_username", username);

        // 새 DefaultOAuth2User를 생성해서 반환 (authentication.getName() 호출 시 custom_username 값을 주도록 설정)
        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                customAttributes,
                "custom_username"
        );
    }
}