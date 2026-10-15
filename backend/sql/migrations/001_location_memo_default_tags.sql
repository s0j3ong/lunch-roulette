-- 이미 schema.sql로 테이블을 만든 DB에 한 번만 실행한다.
-- 기존 memo(위치 메모)를 location으로 옮기고, 100자 메모 컬럼을 새로 만든다.
ALTER TABLE restaurants
    CHANGE COLUMN memo location VARCHAR(255) NULL,
    ADD COLUMN memo VARCHAR(100) NULL AFTER location;

-- 기본 음식 종류에 분식·카페·술집을 더한다. 같은 이름의 사용자 태그가 있으면 기본 태그로 바꾼다.
INSERT INTO tags (user_id, name, is_default)
VALUES
    (1, '분식', TRUE),
    (1, '카페', TRUE),
    (1, '술집', TRUE)
ON DUPLICATE KEY UPDATE is_default = TRUE;
