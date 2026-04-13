package com.chatsphere.controller;

import com.chatsphere.dto.request.ChatRequest;
import com.chatsphere.dto.response.ApiResponse;
import com.chatsphere.dto.response.ChatResponse;
import com.chatsphere.entity.User;
import com.chatsphere.service.ChatService;
import com.chatsphere.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    // ✅ Helper method (NO structural change, just safety)
    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Unauthorized: User not authenticated");
        }
        return userService.getUserEntityByEmail(userDetails.getUsername());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getUserChats(
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        return ResponseEntity.ok(
                ApiResponse.success(chatService.getUserChats(currentUser.getId()))
        );
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ApiResponse<ChatResponse>> getChatById(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        return ResponseEntity.ok(
                ApiResponse.success(chatService.getChatById(chatId, currentUser.getId()))
        );
    }

    @PostMapping("/private")
    public ResponseEntity<ApiResponse<ChatResponse>> getOrCreatePrivateChat(
            @Valid @RequestBody ChatRequest.CreatePrivate request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        ChatResponse chat = chatService.getOrCreatePrivateChat(
                currentUser.getId(),
                request.getRecipientId()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(chat));
    }

    @PostMapping("/group")
    public ResponseEntity<ApiResponse<ChatResponse>> createGroupChat(
            @Valid @RequestBody ChatRequest.CreateGroup request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        ChatResponse chat = chatService.createGroupChat(
                currentUser.getId(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Group created", chat));
    }

    @PostMapping("/{chatId}/join")
    public ResponseEntity<ApiResponse<ChatResponse>> joinGroupChat(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        return ResponseEntity.ok(
                ApiResponse.success(
                        chatService.joinGroupChat(chatId, currentUser.getId())
                )
        );
    }

    @DeleteMapping("/{chatId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroupChat(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        chatService.leaveGroupChat(chatId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Left group chat", null)
        );
    }

    @PostMapping("/{chatId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = getCurrentUser(userDetails);

        chatService.markChatAsRead(chatId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Marked as read", null)
        );
    }

    @GetMapping("/groups/all")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getAllGroupChats() {
        return ResponseEntity.ok(
                ApiResponse.success(chatService.getAllGroupChats())
        );
    }

    @GetMapping("/groups/search")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> searchGroupChats(
            @RequestParam String q) {

        return ResponseEntity.ok(
                ApiResponse.success(chatService.searchGroupChats(q))
        );
    }
}