-- =========================================
-- CodeArena Database Schema
-- =========================================
-- Run this BEFORE starting the Spring Boot app,
-- OR let Hibernate auto-create via ddl-auto=update

CREATE DATABASE IF NOT EXISTS codearena_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codearena_db;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    username          VARCHAR(50)  NOT NULL UNIQUE,
    email             VARCHAR(255) NOT NULL UNIQUE,
    password          VARCHAR(255) NOT NULL,
    full_name         VARCHAR(100),
    role              ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    total_score       INT NOT NULL DEFAULT 0,
    problems_solved   INT NOT NULL DEFAULT 0,
    avatar_url        VARCHAR(512),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        DATETIME,
    last_login        DATETIME,
    INDEX idx_users_username (username),
    INDEX idx_users_role_score (role, total_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- PROBLEMS
-- =========================================
CREATE TABLE IF NOT EXISTS problems (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    title                 VARCHAR(200) NOT NULL,
    description           TEXT NOT NULL,
    constraints           TEXT,
    input_format          TEXT,
    output_format         TEXT,
    difficulty            ENUM('EASY','MEDIUM','HARD') NOT NULL,
    points                INT NOT NULL,
    time_limit_ms         INT NOT NULL DEFAULT 2000,
    memory_limit_mb       INT NOT NULL DEFAULT 256,
    sample_input          TEXT,
    sample_output         TEXT,
    starter_code          TEXT,
    solution_template     TEXT,
    tags                  TEXT,
    created_by            BIGINT,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    total_submissions     INT NOT NULL DEFAULT 0,
    accepted_submissions  INT NOT NULL DEFAULT 0,
    created_at            DATETIME,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_problems_difficulty (difficulty),
    INDEX idx_problems_active (is_active),
    FULLTEXT INDEX idx_problems_search (title, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- TEST CASES
-- =========================================
CREATE TABLE IF NOT EXISTS test_cases (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id       BIGINT NOT NULL,
    input            TEXT NOT NULL,
    expected_output  TEXT NOT NULL,
    is_hidden        BOOLEAN NOT NULL DEFAULT TRUE,
    order_index      INT,
    explanation      TEXT,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_tc_problem (problem_id),
    INDEX idx_tc_order (problem_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- SUBMISSIONS
-- =========================================
CREATE TABLE IF NOT EXISTS submissions (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT NOT NULL,
    problem_id         BIGINT NOT NULL,
    code               TEXT NOT NULL,
    language           VARCHAR(20) NOT NULL DEFAULT 'JAVA',
    status             ENUM('PENDING','RUNNING','ACCEPTED','WRONG_ANSWER',
                            'TIME_LIMIT_EXCEEDED','COMPILATION_ERROR','RUNTIME_ERROR')
                       NOT NULL DEFAULT 'PENDING',
    execution_time_ms  BIGINT,
    memory_used_kb     BIGINT,
    test_cases_passed  INT NOT NULL DEFAULT 0,
    total_test_cases   INT NOT NULL DEFAULT 0,
    score_earned       INT NOT NULL DEFAULT 0,
    error_message      TEXT,
    submitted_at       DATETIME,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_sub_user   (user_id),
    INDEX idx_sub_problem (problem_id),
    INDEX idx_sub_status  (status),
    INDEX idx_sub_user_problem (user_id, problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================
-- NOTE: Default data (admin user + sample problems)
-- is seeded automatically by DataInitializer.java
-- when the Spring Boot application starts.
--
-- Default credentials:
--   Admin:    admin / admin123
--   TestUser: testuser / test123
-- =========================================
