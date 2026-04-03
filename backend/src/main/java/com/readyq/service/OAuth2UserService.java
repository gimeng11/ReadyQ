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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 구글로부터 유저 정보를 가져옴
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. 구글에서 제공하는 정보 추출
        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = oAuth2User.getAttribute("sub"); // 구글 유저 고유 ID
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // 3. DB에 해당 이메일이 있는지 확인
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // 4. DB에 없으면 자동 회원가입 처리
            user = new User();
            user.setUsername(provider + "_" + providerId); // 중복 방지를 위한 자동 아이디 생성
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // 임의의 비밀번호
            user.setEmail(email);
            user.setNickname(name);
            user.setProvider(provider);
            user.setProviderId(providerId);
            userRepository.save(user);
        }

        return oAuth2User; // 스프링 시큐리티 내부적으로 사용됨
    }
}