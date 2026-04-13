package com.chatsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private String type; // MESSAGE, TYPING, ONLINE_STATUS, READ_RECEIPT, NOTIFICATION
    private Object payload;
    private Long chatId;
    private Long senderId;
    private String senderUsername;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static WebSocketMessage typing(Long chatId, Long senderId, String username, boolean isTyping) {
        return WebSocketMessage.builder()
                .type("TYPING")
                .chatId(chatId)
                .senderId(senderId)
                .senderUsername(username)
                .payload(isTyping)
                .build();
    }

    public static WebSocketMessage onlineStatus(Long userId, String username, boolean isOnline) {
        return WebSocketMessage.builder()
                .type("ONLINE_STATUS")
                .senderId(userId)
                .senderUsername(username)
                .payload(isOnline)
                .build();
    }

    public static WebSocketMessage readReceipt(Long chatId, Long userId) {
        return WebSocketMessage.builder()
                .type("READ_RECEIPT")
                .chatId(chatId)
                .senderId(userId)
                .build();
    }
}
