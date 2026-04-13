package com.codearena.repository;

import com.codearena.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = 'USER' ORDER BY u.totalScore DESC, u.problemsSolved DESC")
    List<User> findLeaderboard(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = 'USER' AND u.isActive = true ORDER BY u.totalScore DESC")
    Page<User> findActiveUsers(Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'USER'")
    Long countRegularUsers();
}
