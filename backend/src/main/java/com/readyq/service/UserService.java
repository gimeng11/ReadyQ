package com.readyq.service;

import com.readyq.dto.UserResponse;
import com.readyq.dto.UserUpdateRequest;
import com.readyq.model.User;
import com.readyq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
        return new UserResponse(user);
    }

    public UserResponse updateUserInfo(String username, UserUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        if (request.getNickname() != null) user.setNickname(request.getNickname());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        if (request.getCareer() != null) user.setCareer(request.getCareer());

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }
}
