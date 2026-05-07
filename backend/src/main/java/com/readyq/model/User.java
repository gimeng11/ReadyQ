package com.readyq.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;    // 아이디

    private String password;    // BCrypt 암호화

    private String nickname;    // 닉네임

    @Indexed(unique = true)
    private String email;

    private String phone;

    private String role = "USER";   // USER | COMPANY

    private String jobTitle;     // 직무 (예: 백엔드 개발자, 디자이너 등)
    private String career;       // 경력 (예: 신입, 1년, 3년 등)

    private String provider;    // 가입 경로 local, google, kakao, naver
    private String providerId;  // sns 유저의 고유 식별 번호

    private LocalDateTime createdAt = LocalDateTime.now();
}
