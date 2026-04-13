package com.chatsphere.service;

import com.chatsphere.dto.request.MessageRequest;
import com.chatsphere.dto.response.MessageResponse;
import com.chatsphere.entity.*;
import com.chatsphere.exception.BadRequestException;
import com.chatsphere.exception.ResourceNotFoundException;
import com.chatsphere.exception.UnauthorizedException;
import com.chatsphere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageResponse sendMessage(Long senderId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", senderId));
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat", request.getChatId()));

        if (!chatMemberRepository.existsByChatIdAndUserId(request.getChatId(), senderId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        if (request.getContent() == null && request.getFileUrl() == null) {
            throw new BadRequestException("Message must have content or a file");
        }

        Message.MessageBuilder builder = Message.builder()
                .chat(chat)
                .sender(sender)
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : Message.MessageType.TEXT)
                .status(Message.MessageStatus.SENT)
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize());

        if (request.getReplyToId() != null) {
            messageRepository.findById(request.getReplyToId()).ifPresent(builder::replyTo);
        }

        Message message = messageRepository.save(builder.build());

        // Update chat updatedAt
        chat.setUpdatedAt(LocalDateTime.now());
        chatRepository.save(chat);

        MessageResponse response = MessageResponse.from(message);

        // Broadcast to all chat members via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + request.getChatId(), response);

        // Send notification to offline members
        chat.getMembers().forEach(member -> {
            if (!member.getUser().getId().equals(senderId)) {
                messagingTemplate.convertAndSendToUser(
                    member.getUser().getEmail(),
                    "/queue/notifications",
                    response
                );
            }
        });

        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getChatMessages(Long chatId, Long userId, int page, int size) {
        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
        return messages.getContent().stream()
                .map(MessageResponse::from)
                .collect(Collectors.collectingAndThen(
                    Collectors.toList(),
                    list -> { java.util.Collections.reverse(list); return list; }
                ));
    }

    @Transactional
    public MessageResponse editMessage(Long messageId, Long userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", messageId));
        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }
        message.setContent(newContent);
        message.setEditedAt(LocalDateTime.now());
        Message saved = messageRepository.save(message);
        MessageResponse response = MessageResponse.from(saved);
        messagingTemplate.convertAndSend("/topic/chat/" + saved.getChat().getId(), response);
        return response;
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", messageId));
        if (!message.getSender().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own messages");
        }
        message.setIsDeleted(true);
        messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId(),
            MessageResponse.from(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(Long chatId, Long userId, String query) {
        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }
        return messageRepository.searchMessagesInChat(chatId, query)
                .stream().map(MessageResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public void updateMessageStatus(Long chatId, Long userId, Message.MessageStatus status) {
        // In a production app you'd batch-update messages. For simplicity, broadcast status change.
        messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/status",
            java.util.Map.of("chatId", chatId, "userId", userId, "status", status.name()));
    }
}
