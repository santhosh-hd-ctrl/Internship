package com.chatsphere.dto.request;

import com.chatsphere.entity.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {
    @NotNull(message = "Chat ID is required")
    private Long chatId;

    private String content;

    private Message.MessageType type = Message.MessageType.TEXT;

    private Long replyToId;

    private String fileUrl;
    private String fileName;
    private Long fileSize;
}
