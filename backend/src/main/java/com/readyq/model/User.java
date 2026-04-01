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

    private LocalDateTime createdAt = LocalDateTime.now();
}
