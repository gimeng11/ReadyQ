package com.readyq.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FindPasswordVerifyRequest {

    @NotBlank(message = "아이디를 입력하세요")
    private String username;

    @NotBlank(message = "이메일을 입력하세요")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email;

    @NotBlank(message = "인증코드를 입력하세요")
    private String code;
}
