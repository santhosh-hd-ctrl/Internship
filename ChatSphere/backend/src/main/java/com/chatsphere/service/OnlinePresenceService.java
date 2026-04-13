package com.chatsphere.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnlinePresenceService {

    private static final String ONLINE_USERS_KEY = "online_users";
    private static final String USER_SESSION_PREFIX = "user_session:";
    private static final String TYPING_PREFIX = "typing:";

    private final RedisTemplate<String, Object> redisTemplate;

    public void setUserOnline(Long userId) {
        try {
            redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId.toString());
            redisTemplate.opsForValue().set(USER_SESSION_PREFIX + userId, "online", Duration.ofHours(24));
        } catch (Exception e) {
            log.error("Error setting user online in Redis: {}", e.getMessage());
        }
    }

    public void setUserOffline(Long userId) {
        try {
            redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId.toString());
            redisTemplate.delete(USER_SESSION_PREFIX + userId);
        } catch (Exception e) {
            log.error("Error setting user offline in Redis: {}", e.getMessage());
        }
    }

    public boolean isUserOnline(Long userId) {
        try {
            Boolean isMember = redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, userId.toString());
            return Boolean.TRUE.equals(isMember);
        } catch (Exception e) {
            log.error("Error checking user online status in Redis: {}", e.getMessage());
            return false;
        }
    }

    public Set<Object> getOnlineUsers() {
        try {
            return redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
        } catch (Exception e) {
            log.error("Error getting online users from Redis: {}", e.getMessage());
            return Set.of();
        }
    }

    public void setTyping(Long chatId, Long userId, boolean isTyping) {
        String key = TYPING_PREFIX + chatId + ":" + userId;
        try {
            if (isTyping) {
                redisTemplate.opsForValue().set(key, "typing", 5, TimeUnit.SECONDS);
            } else {
                redisTemplate.delete(key);
            }
        } catch (Exception e) {
            log.error("Error setting typing indicator: {}", e.getMessage());
        }
    }

    public boolean isTyping(Long chatId, Long userId) {
        try {
            return redisTemplate.hasKey(TYPING_PREFIX + chatId + ":" + userId);
        } catch (Exception e) {
            return false;
        }
    }
}
