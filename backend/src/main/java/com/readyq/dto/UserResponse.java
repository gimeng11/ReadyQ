package com.readyq.dto;

import com.readyq.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserResponse {
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String jobTitle;
    private String career;
    private String provider;

    public UserResponse(User user) {
        this.username = user.getUsername();
        this.nickname = user.getNickname();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.jobTitle = user.getJobTitle();
        this.career = user.getCareer();
        this.provider = user.getProvider();
    }
}
