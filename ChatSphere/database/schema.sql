-- ChatSphere Database Schema
-- Run this after creating the database, or let Spring Boot auto-create via ddl-auto=update

CREATE DATABASE IF NOT EXISTS chatsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chatsphere;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url   VARCHAR(500),
    bio          TEXT,
    role         ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    is_online    BOOLEAN DEFAULT FALSE,
    last_seen    DATETIME,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email    (email),
    INDEX idx_username (username),
    INDEX idx_is_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    type        ENUM('PRIVATE','GROUP') NOT NULL,
    chat_name   VARCHAR(100),
    description TEXT,
    avatar_url  VARCHAR(500),
    created_by  BIGINT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type       (type),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id      BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    role         ENUM('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
    last_read_at DATETIME,
    is_muted     BOOLEAN DEFAULT FALSE,
    joined_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chat_user (chat_id, user_id),
    INDEX idx_chat_id (chat_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id     BIGINT NOT NULL,
    sender_id   BIGINT NOT NULL,
    content     TEXT,
    type        ENUM('TEXT','IMAGE','FILE','EMOJI','SYSTEM','VOICE') NOT NULL DEFAULT 'TEXT',
    status      ENUM('SENT','DELIVERED','READ') NOT NULL DEFAULT 'SENT',
    file_url    VARCHAR(500),
    file_name   VARCHAR(255),
    file_size   BIGINT,
    reply_to_id BIGINT,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    edited_at   DATETIME,
    FOREIGN KEY (chat_id)     REFERENCES chats(id)    ON DELETE CASCADE,
    FOREIGN KEY (sender_id)   REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_chat_id   (chat_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert a default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, display_name, role, is_active)
VALUES ('admin', 'admin@chatsphere.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'Administrator', 'ADMIN', TRUE);
