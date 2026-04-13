package com.chatsphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

public class ChatRequest {

    @Data
    public static class CreateGroup {
        @NotBlank(message = "Group name is required")
        @Size(min = 2, max = 100, message = "Group name must be between 2 and 100 characters")
        private String chatName;

        @Size(max = 500)
        private String description;

        private List<Long> memberIds;
    }

    @Data
    public static class CreatePrivate {
        @NotNull(message = "Recipient user ID is required")
        private Long recipientId;
    }

    @Data
    public static class UpdateGroup {
        @Size(min = 2, max = 100)
        private String chatName;

        @Size(max = 500)
        private String description;
    }
}
