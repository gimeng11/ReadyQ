package com.readyq.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String nickname;
    private String jobTitle;
    private String career;
}
