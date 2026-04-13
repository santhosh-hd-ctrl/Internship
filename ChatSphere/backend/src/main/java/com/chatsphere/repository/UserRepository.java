package com.chatsphere.repository;

import com.chatsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.id != :currentUserId " +
           "AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("query") String query, @Param("currentUserId") Long currentUserId);

    @Query("SELECT u FROM User u WHERE u.isOnline = true AND u.isActive = true AND u.id != :currentUserId")
    List<User> findOnlineUsers(@Param("currentUserId") Long currentUserId);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.id != :currentUserId ORDER BY u.displayName ASC")
    List<User> findAllActiveUsersExcept(@Param("currentUserId") Long currentUserId);
}
