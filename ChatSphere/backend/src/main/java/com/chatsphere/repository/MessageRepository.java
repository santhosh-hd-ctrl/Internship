package com.chatsphere.repository;

import com.chatsphere.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Pagination (latest messages)
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.isDeleted = false ORDER BY m.createdAt DESC")
    Page<Message> findByChatIdOrderByCreatedAtDesc(@Param("chatId") Long chatId, Pageable pageable);

    // Full chat history
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<Message> findByChatIdOrderByCreatedAtAsc(@Param("chatId") Long chatId);

    // Search messages
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.isDeleted = false " +
            "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Message> searchMessagesInChat(@Param("chatId") Long chatId, @Param("query") String query);

    // Unread count
    @Query("SELECT COUNT(m) FROM Message m JOIN m.chat c JOIN c.members cm " +
            "WHERE c.id = :chatId AND m.sender.id != :userId AND m.isDeleted = false " +
            "AND (cm.lastReadAt IS NULL OR m.createdAt > cm.lastReadAt) AND cm.user.id = :userId")
    long countUnreadMessages(@Param("chatId") Long chatId, @Param("userId") Long userId);

    // ✅ CORRECT latest message (NO Pageable)
    Optional<Message> findTopByChatIdAndIsDeletedFalseOrderByCreatedAtDesc(Long chatId);
}