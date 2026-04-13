package com.smarthospital.service;

import com.smarthospital.dto.Dtos.*;
import com.smarthospital.entity.Notification;
import com.smarthospital.entity.User;
import com.smarthospital.exception.ResourceNotFoundException;
import com.smarthospital.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JavaMailSender mailSender;

    @Value("${app.mail.simulation:true}")
    private boolean mailSimulation;

    public Notification createNotification(User user, String title, String message, Notification.NotificationType type) {
        Notification notification = notificationRepository.save(Notification.builder()
                .user(user).title(title).message(message).type(type).build());

        // Push real-time notification via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(), "/queue/notifications",
                    mapToDto(notification));
        } catch (Exception e) {
            log.warn("WebSocket notification failed: {}", e.getMessage());
        }

        // Send email (simulated or real)
        sendEmail(user.getEmail(), title, message);

        return notification;
    }

    public void sendEmail(String to, String subject, String body) {
        if (mailSimulation) {
            log.info("[EMAIL SIMULATION] To: {} | Subject: {} | Body: {}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[SmartHospital] " + subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public Page<NotificationDto> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToDto);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        notificationRepository.findByUserOrderByCreatedAtDesc(user, Pageable.unpaged())
                .forEach(n -> { n.setRead(true); notificationRepository.save(n); });
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .type(n.getType().name()).isRead(n.isRead())
                .createdAt(n.getCreatedAt()).build();
    }
}
