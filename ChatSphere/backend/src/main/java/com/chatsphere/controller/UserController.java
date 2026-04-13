package com.chatsphere.controller;

import com.chatsphere.dto.response.ApiResponse;
import com.chatsphere.dto.response.UserResponse;
import com.chatsphere.entity.User;
import com.chatsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(currentUser.getId())));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(q, currentUser.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        UserResponse updated = userService.updateProfile(
            currentUser.getId(),
            body.get("displayName"),
            body.get("bio"),
            body.get("avatarUrl")
        );
        return ResponseEntity.ok(ApiResponse.success("Profile updated", updated));
    }
}
