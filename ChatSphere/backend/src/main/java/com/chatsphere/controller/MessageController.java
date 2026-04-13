package com.chatsphere.controller;

import com.chatsphere.dto.request.MessageRequest;
import com.chatsphere.dto.response.ApiResponse;
import com.chatsphere.dto.response.MessageResponse;
import com.chatsphere.entity.User;
import com.chatsphere.service.MessageService;
import com.chatsphere.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        MessageResponse response = messageService.sendMessage(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        List<MessageResponse> messages = messageService.getChatMessages(chatId, currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable Long messageId,
            @RequestBody java.util.Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        MessageResponse response = messageService.editMessage(messageId, currentUser.getId(), body.get("content"));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        messageService.deleteMessage(messageId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Message deleted", null));
    }

    @GetMapping("/chat/{chatId}/search")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> searchMessages(
            @PathVariable Long chatId,
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userService.getUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageService.searchMessages(chatId, currentUser.getId(), q)));
    }
}
