-- 이미 001까지 적용한 DB에 한 번만 실행한다.
-- 회원가입·로그인을 위해 users, sessions 테이블을 만들고 식당·태그를 사용자에 연결한다.
-- 주의: 로그인 이전에 user_id = 1로 저장한 식당·태그를 모두 삭제한다(되돌릴 수 없다).
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
    token_hash CHAR(64) NOT NULL,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (token_hash),
    INDEX ix_sessions_user_id (user_id),
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM restaurant_tags;
DELETE FROM restaurants;
DELETE FROM tags;

ALTER TABLE restaurants
    MODIFY COLUMN user_id INT NOT NULL,
    ADD CONSTRAINT fk_restaurants_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE;

ALTER TABLE tags
    MODIFY COLUMN user_id INT NOT NULL,
    ADD CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE;
