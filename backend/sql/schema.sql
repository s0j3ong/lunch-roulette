CREATE TABLE restaurants (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    price INT NULL,
    memo VARCHAR(255) NULL,
    visited BOOLEAN NOT NULL DEFAULT FALSE,
    rating TINYINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX ix_restaurants_user_visited (user_id, visited),
    INDEX ix_restaurants_user_price (user_id, price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL DEFAULT 1,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tags_user_name (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE restaurant_tags (
    restaurant_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (restaurant_id, tag_id),
    INDEX ix_restaurant_tags_tag_id (tag_id),
    CONSTRAINT fk_restaurant_tags_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_restaurant_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tags (user_id, name, is_default)
VALUES
    (1, '한식', TRUE),
    (1, '중식', TRUE),
    (1, '일식', TRUE),
    (1, '양식', TRUE);
