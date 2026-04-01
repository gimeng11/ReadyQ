package com.readyq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SmsVerifyRequest {
    @NotBlank
    @Pattern(regexp = "^010-\\d{4}-\\d{4}$")
    private String phone;

    @NotBlank(message = "인증번호를 입력하세요")
    @Size(min = 6, max = 6, message = "인증번호는 6자리입니다")
    private String code;
}
