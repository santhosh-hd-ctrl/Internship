package com.chatsphere.config;

import com.chatsphere.security.JwtUtil;
import com.chatsphere.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user"); // ✅ correct
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {

                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // ✅ FIX: safe null check + correct condition
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {

                    log.info("🔌 WebSocket CONNECT request received");

                    String authToken = accessor.getFirstNativeHeader("Authorization");

                    log.info("Headers: {}", accessor.toNativeHeaderMap());

                    // ✅ FIX: proper validation
                    if (StringUtils.hasText(authToken) && authToken.startsWith("Bearer ")) {

                        String jwt = authToken.substring(7);

                        try {
                            String email = jwtUtil.extractUsername(jwt);

                            UserDetails userDetails =
                                    userDetailsService.loadUserByUsername(email);

                            // ✅ FIX: validate properly
                            if (jwtUtil.isTokenValid(jwt, userDetails)) {

                                UsernamePasswordAuthenticationToken auth =
                                        new UsernamePasswordAuthenticationToken(
                                                userDetails,
                                                null,
                                                userDetails.getAuthorities()
                                        );

                                // ✅ IMPORTANT: sets user for WebSocket session
                                accessor.setUser(auth);

                                log.info("✅ WebSocket authenticated user: {}", email);

                            } else {
                                log.warn("❌ Invalid JWT token");
                            }

                        } catch (Exception e) {
                            log.error("❌ WebSocket authentication failed: {}", e.getMessage());
                        }

                    } else {
                        log.warn("⚠️ Authorization header missing or invalid");
                    }
                }

                return message;
            }
        });
    }
}