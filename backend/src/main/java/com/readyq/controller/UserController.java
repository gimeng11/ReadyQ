package com.readyq.controller;

import com.readyq.dto.UserResponse;
import com.readyq.dto.UserUpdateRequest;
import com.readyq.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyInfo(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.getUserInfo(username));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyInfo(
            @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateUserInfo(username, request));
    }
}
