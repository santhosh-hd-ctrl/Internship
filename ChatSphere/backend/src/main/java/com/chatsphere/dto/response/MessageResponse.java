package com.chatsphere.dto.response;

import com.chatsphere.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long chatId;
    private UserResponse sender;
    private String content;
    private Message.MessageType type;
    private Message.MessageStatus status;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private MessageResponse replyTo;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;

    public static MessageResponse from(Message message) {
        MessageResponse response = MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat().getId())
                .sender(UserResponse.from(message.getSender()))
                .content(message.getIsDeleted() ? "This message was deleted" : message.getContent())
                .type(message.getType())
                .status(message.getStatus())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt())
                .editedAt(message.getEditedAt())
                .build();

        if (message.getReplyTo() != null) {
            response.setReplyTo(MessageResponse.builder()
                    .id(message.getReplyTo().getId())
                    .content(message.getReplyTo().getContent())
                    .sender(UserResponse.from(message.getReplyTo().getSender()))
                    .type(message.getReplyTo().getType())
                    .createdAt(message.getReplyTo().getCreatedAt())
                    .build());
        }

        return response;
    }
}
