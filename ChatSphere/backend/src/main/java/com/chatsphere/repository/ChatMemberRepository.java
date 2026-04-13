package com.chatsphere.repository;

import com.chatsphere.entity.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {

    Optional<ChatMember> findByChatIdAndUserId(Long chatId, Long userId);

    boolean existsByChatIdAndUserId(Long chatId, Long userId);

    List<ChatMember> findByChatId(Long chatId);

    @Modifying
    @Query("DELETE FROM ChatMember cm WHERE cm.chat.id = :chatId AND cm.user.id = :userId")
    void deleteByChatIdAndUserId(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Query("SELECT COUNT(cm) FROM ChatMember cm WHERE cm.chat.id = :chatId")
    long countByChatId(@Param("chatId") Long chatId);
}
