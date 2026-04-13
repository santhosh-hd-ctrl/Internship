package com.chatsphere.service;

import com.chatsphere.dto.request.ChatRequest;
import com.chatsphere.dto.response.ChatResponse;
import com.chatsphere.dto.response.MessageResponse;
import com.chatsphere.dto.response.UserResponse;
import com.chatsphere.entity.*;
import com.chatsphere.exception.BadRequestException;
import com.chatsphere.exception.ResourceNotFoundException;
import com.chatsphere.exception.UnauthorizedException;
import com.chatsphere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final OnlinePresenceService presenceService;

    @Transactional
    public ChatResponse createPrivateChat(Long currentUserId, ChatRequest.CreatePrivate request) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUserId));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getRecipientId()));

        if (chatRepository.findPrivateChat(currentUserId, request.getRecipientId()).isPresent()) {
            throw new BadRequestException("Private chat already exists");
        }

        Chat chat = Chat.builder()
                .type(Chat.ChatType.PRIVATE)
                .createdBy(currentUser)
                .build();

        chat = chatRepository.save(chat);

        chatMemberRepository.save(ChatMember.builder()
                .chat(chat)
                .user(currentUser)
                .role(ChatMember.MemberRole.MEMBER)
                .build());

        chatMemberRepository.save(ChatMember.builder()
                .chat(chat)
                .user(recipient)
                .role(ChatMember.MemberRole.MEMBER)
                .build());

        return buildChatResponse(chat, currentUserId);
    }

    @Transactional
    public ChatResponse getOrCreatePrivateChat(Long currentUserId, Long recipientId) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUserId));

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", recipientId));

        Chat chat = chatRepository.findPrivateChat(currentUserId, recipientId).orElse(null);

        if (chat != null) {
            return buildChatResponse(chat, currentUserId);
        }

        Chat newChat = Chat.builder()
                .type(Chat.ChatType.PRIVATE)
                .createdBy(currentUser)
                .build();

        newChat = chatRepository.save(newChat);

        chatMemberRepository.save(ChatMember.builder()
                .chat(newChat)
                .user(currentUser)
                .role(ChatMember.MemberRole.MEMBER)
                .build());

        chatMemberRepository.save(ChatMember.builder()
                .chat(newChat)
                .user(recipient)
                .role(ChatMember.MemberRole.MEMBER)
                .build());

        return buildChatResponse(newChat, currentUserId);
    }

    @Transactional
    public ChatResponse createGroupChat(Long currentUserId, ChatRequest.CreateGroup request) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", currentUserId));

        Chat chat = Chat.builder()
                .type(Chat.ChatType.GROUP)
                .chatName(request.getChatName())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build();

        chat = chatRepository.save(chat);

        // creator as admin
        chatMemberRepository.save(ChatMember.builder()
                .chat(chat)
                .user(currentUser)
                .role(ChatMember.MemberRole.ADMIN)
                .build());

        // add members
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {

                if (!memberId.equals(currentUserId)) {

                    User member = userRepository.findById(memberId).orElse(null);

                    if (member != null) {
                        chatMemberRepository.save(ChatMember.builder()
                                .chat(chat)
                                .user(member)
                                .role(ChatMember.MemberRole.MEMBER)
                                .build());
                    }
                }
            }
        }

        return buildChatResponse(chat, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getUserChats(Long userId) {

        return chatRepository.findChatsByUserId(userId)
                .stream()
                .map(chat -> buildChatResponse(chat, userId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatResponse getChatById(Long chatId, Long userId) {

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", chatId));

        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        return buildChatResponse(chat, userId);
    }

    @Transactional
    public ChatResponse joinGroupChat(Long chatId, Long userId) {

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", chatId));

        if (chat.getType() != Chat.ChatType.GROUP) {
            throw new BadRequestException("Can only join group chats");
        }

        if (chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new BadRequestException("Already a member");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        chatMemberRepository.save(ChatMember.builder()
                .chat(chat)
                .user(user)
                .role(ChatMember.MemberRole.MEMBER)
                .build());

        return buildChatResponse(chat, userId);
    }

    @Transactional
    public void leaveGroupChat(Long chatId, Long userId) {

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", chatId));

        if (chat.getType() != Chat.ChatType.GROUP) {
            throw new BadRequestException("Can only leave group chats");
        }

        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new BadRequestException("Not a member");
        }

        chatMemberRepository.deleteByChatIdAndUserId(chatId, userId);
    }

    @Transactional
    public void markChatAsRead(Long chatId, Long userId) {

        ChatMember member = chatMemberRepository
                .findByChatIdAndUserId(chatId, userId)
                .orElse(null);

        if (member != null) {
            member.setLastReadAt(LocalDateTime.now());
            chatMemberRepository.save(member);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> searchGroupChats(String query) {

        return chatRepository.searchGroupChats(query)
                .stream()
                .map(chat -> buildChatResponse(chat, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getAllGroupChats() {

        return chatRepository.findAllGroupChats()
                .stream()
                .map(chat -> buildChatResponse(chat, null))
                .collect(Collectors.toList());
    }

    private ChatResponse buildChatResponse(Chat chat, Long currentUserId) {

        List<ChatResponse.ChatMemberResponse> memberResponses = chat.getMembers()
                .stream()
                .map(m -> {

                    UserResponse ur = UserResponse.from(m.getUser());
                    ur.setIsOnline(presenceService.isUserOnline(m.getUser().getId()));

                    return ChatResponse.ChatMemberResponse.builder()
                            .id(m.getId())
                            .user(ur)
                            .role(m.getRole())
                            .joinedAt(m.getJoinedAt())
                            .lastReadAt(m.getLastReadAt())
                            .build();
                })
                .collect(Collectors.toList());

        MessageResponse lastMsg = messageRepository
                .findTopByChatIdAndIsDeletedFalseOrderByCreatedAtDesc(chat.getId())
                .map(MessageResponse::from)
                .orElse(null);

        long unread = 0;

        if (currentUserId != null) {
            unread = messageRepository.countUnreadMessages(chat.getId(), currentUserId);
        }

        UserResponse createdBy = chat.getCreatedBy() != null
                ? UserResponse.from(chat.getCreatedBy())
                : null;

        return ChatResponse.builder()
                .id(chat.getId())
                .type(chat.getType())
                .chatName(chat.getChatName())
                .description(chat.getDescription())
                .avatarUrl(chat.getAvatarUrl())
                .createdBy(createdBy)
                .members(memberResponses)
                .lastMessage(lastMsg)
                .unreadCount(unread)
                .createdAt(chat.getCreatedAt())
                .updatedAt(chat.getUpdatedAt())
                .build();
    }
}