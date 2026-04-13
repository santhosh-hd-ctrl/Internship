package com.chatsphere.service;

import com.chatsphere.dto.response.UserResponse;
import com.chatsphere.entity.User;
import com.chatsphere.exception.ResourceNotFoundException;
import com.chatsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final OnlinePresenceService presenceService;

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String query, Long currentUserId) {
        return userRepository.searchUsers(query, currentUserId)
                .stream()
                .map(u -> {
                    UserResponse r = UserResponse.from(u);
                    r.setIsOnline(presenceService.isUserOnline(u.getId()));
                    return r;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(Long currentUserId) {
        return userRepository.findAllActiveUsersExcept(currentUserId)
                .stream()
                .map(u -> {
                    UserResponse r = UserResponse.from(u);
                    r.setIsOnline(presenceService.isUserOnline(u.getId()));
                    return r;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String displayName, String bio, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (displayName != null) user.setDisplayName(displayName);
        if (bio != null) user.setBio(bio);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void setOnlineStatus(Long userId, boolean isOnline) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsOnline(isOnline);
            if (!isOnline) user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
        if (isOnline) presenceService.setUserOnline(userId);
        else presenceService.setUserOffline(userId);
    }

    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
