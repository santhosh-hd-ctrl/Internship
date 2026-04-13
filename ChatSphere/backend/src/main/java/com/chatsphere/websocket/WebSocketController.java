package com.chatsphere.websocket;

import com.chatsphere.dto.WebSocketMessage;
import com.chatsphere.dto.request.MessageRequest;
import com.chatsphere.dto.response.MessageResponse;
import com.chatsphere.entity.User;
import com.chatsphere.service.MessageService;
import com.chatsphere.service.OnlinePresenceService;
import com.chatsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final MessageService messageService;
    private final OnlinePresenceService presenceService;

    @EventListener
    public void handleWebSocketConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            try {
                User user = userService.getUserEntityByEmail(principal.getName());
                userService.setOnlineStatus(user.getId(), true);
                log.info("User connected: {}", user.getEmail());
                // Broadcast online status
                messagingTemplate.convertAndSend("/topic/online",
                    WebSocketMessage.onlineStatus(user.getId(), user.getUsername(), true));
            } catch (Exception e) {
                log.error("Error handling connect event: {}", e.getMessage());
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal != null) {
            try {
                User user = userService.getUserEntityByEmail(principal.getName());
                userService.setOnlineStatus(user.getId(), false);
                log.info("User disconnected: {}", user.getEmail());
                messagingTemplate.convertAndSend("/topic/online",
                    WebSocketMessage.onlineStatus(user.getId(), user.getUsername(), false));
            } catch (Exception e) {
                log.error("Error handling disconnect event: {}", e.getMessage());
            }
        }
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest request, Principal principal) {
        try {
            User sender = userService.getUserEntityByEmail(principal.getName());
            messageService.sendMessage(sender.getId(), request);
        } catch (Exception e) {
            log.error("Error sending message via WebSocket: {}", e.getMessage());
        }
    }

    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload, Principal principal) {
        try {
            User user = userService.getUserEntityByEmail(principal.getName());
            Long chatId = Long.valueOf(payload.get("chatId").toString());
            boolean isTyping = Boolean.parseBoolean(payload.get("isTyping").toString());
            presenceService.setTyping(chatId, user.getId(), isTyping);
            messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/typing",
                WebSocketMessage.typing(chatId, user.getId(), user.getUsername(), isTyping));
        } catch (Exception e) {
            log.error("Error handling typing event: {}", e.getMessage());
        }
    }

    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload Map<String, Object> payload, Principal principal) {
        try {
            User user = userService.getUserEntityByEmail(principal.getName());
            Long chatId = Long.valueOf(payload.get("chatId").toString());
            messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/read",
                WebSocketMessage.readReceipt(chatId, user.getId()));
        } catch (Exception e) {
            log.error("Error handling read receipt: {}", e.getMessage());
        }
    }
}
