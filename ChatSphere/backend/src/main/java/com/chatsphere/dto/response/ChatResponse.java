package com.chatsphere.dto.response;

import com.chatsphere.entity.Chat;
import com.chatsphere.entity.ChatMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private Chat.ChatType type;
    private String chatName;
    private String description;
    private String avatarUrl;
    private UserResponse createdBy;
    private List<ChatMemberResponse> members;
    private MessageResponse lastMessage;
    private long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMemberResponse {
        private Long id;
        private UserResponse user;
        private ChatMember.MemberRole role;
        private LocalDateTime joinedAt;
        private LocalDateTime lastReadAt;
    }
}
