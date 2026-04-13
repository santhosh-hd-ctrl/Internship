package com.chatsphere.repository;

import com.chatsphere.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query("SELECT c FROM Chat c JOIN c.members m WHERE m.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Chat> findChatsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Chat c JOIN c.members m1 JOIN c.members m2 " +
           "WHERE c.type = 'PRIVATE' AND m1.user.id = :user1Id AND m2.user.id = :user2Id")
    Optional<Chat> findPrivateChat(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query("SELECT c FROM Chat c WHERE c.type = 'GROUP' AND " +
           "(LOWER(c.chatName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Chat> searchGroupChats(@Param("query") String query);

    @Query("SELECT c FROM Chat c WHERE c.type = 'GROUP' ORDER BY c.createdAt DESC")
    List<Chat> findAllGroupChats();

    @Query("SELECT c FROM Chat c JOIN c.members m WHERE m.user.id = :userId AND c.type = 'GROUP' ORDER BY c.updatedAt DESC")
    List<Chat> findGroupChatsByUserId(@Param("userId") Long userId);
}
