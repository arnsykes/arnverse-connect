-- ===================================================================
-- ARNVERSE Migrations Tracking (Shared Hosting Safe)
-- File: 02_migrations.sql
-- 
-- PETUNJUK IMPORT:
-- 1. Pastikan 00_schema.sql dan 01_seed.sql sudah diimport
-- 2. Import file ini untuk mencatat migrasi yang sudah dijalankan
-- 3. File ini AMAN dijalankan berulang (idempotent)
-- ===================================================================

-- Catat semua migrasi yang sudah dijalankan
INSERT IGNORE INTO migrations (migration, batch, ran_at) VALUES
('001_create_core_tables', 1, NOW()),
('002_create_user_management', 1, NOW()),
('003_create_posts_system', 1, NOW()),
('004_create_engagement_system', 1, NOW()),
('005_create_social_features', 1, NOW()),
('006_create_stories_system', 1, NOW()),
('007_create_hashtags_system', 1, NOW()),
('008_create_messaging_system', 1, NOW()),
('009_create_notifications', 1, NOW()),
('010_create_moderation_system', 1, NOW()),
('011_create_triggers', 1, NOW()),
('012_create_indexes', 1, NOW()),
('013_seed_default_data', 1, NOW()),
('014_seed_demo_users', 1, NOW()),
('015_seed_demo_content', 1, NOW());

-- ===================================================================
-- STORED PROCEDURES untuk maintenance
-- ===================================================================

DELIMITER $$

-- Procedure untuk membersihkan story yang expired
CREATE PROCEDURE IF NOT EXISTS CleanExpiredStories()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Hapus story yang sudah expired (lebih dari 24 jam)
    DELETE FROM stories 
    WHERE expired_at IS NOT NULL 
    AND expired_at < NOW();
    
    -- Hapus juga story yang tidak ada expired_at tapi sudah lebih dari 24 jam
    DELETE FROM stories 
    WHERE expired_at IS NULL 
    AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
    
    COMMIT;
END$$

-- Procedure untuk membersihkan notifikasi lama
CREATE PROCEDURE IF NOT EXISTS CleanOldNotifications()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Hapus notifikasi yang sudah dibaca dan lebih dari 30 hari
    DELETE FROM notifications 
    WHERE is_read = 1 
    AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- Hapus notifikasi yang belum dibaca tapi lebih dari 90 hari
    DELETE FROM notifications 
    WHERE is_read = 0 
    AND created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    COMMIT;
END$$

-- Procedure untuk membersihkan session yang expired
CREATE PROCEDURE IF NOT EXISTS CleanExpiredSessions()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Hapus session yang sudah expired
    DELETE FROM user_sessions 
    WHERE expired_at IS NOT NULL 
    AND expired_at < NOW();
    
    -- Hapus session yang tidak ada expired_at tapi last_used_at lebih dari 7 hari
    DELETE FROM user_sessions 
    WHERE expired_at IS NULL 
    AND last_used_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    COMMIT;
END$$

-- Procedure untuk update trending score hashtags
CREATE PROCEDURE IF NOT EXISTS UpdateTrendingScores()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update trending score berdasarkan aktivitas 7 hari terakhir
    UPDATE hashtags h SET 
        trending_score = (
            SELECT COALESCE(
                (COUNT(ph.id) * 10) + -- Base score dari jumlah post
                (SUM(p.likes_count) * 2) + -- Bonus dari likes
                (SUM(p.comments_count) * 3) + -- Bonus dari comments
                (SUM(p.views_count) * 0.1), -- Bonus dari views
                0
            )
            FROM post_hashtags ph
            JOIN posts p ON ph.post_id = p.id
            WHERE ph.hashtag_id = h.id
            AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        )
    WHERE EXISTS (
        SELECT 1 FROM post_hashtags ph2 
        JOIN posts p2 ON ph2.post_id = p2.id 
        WHERE ph2.hashtag_id = h.id 
        AND p2.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    );
    
    -- Set trending score ke 0 untuk hashtag yang tidak ada aktivitas
    UPDATE hashtags SET trending_score = 0 
    WHERE last_used_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    OR last_used_at IS NULL;
    
    COMMIT;
END$$

DELIMITER ;

-- ===================================================================
-- VIEWS untuk query yang sering digunakan
-- ===================================================================

-- View untuk user stats lengkap
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.avatar,
    u.is_verified,
    u.is_private,
    u.posts_count,
    u.followers_count,
    u.following_count,
    (SELECT COUNT(*) FROM stories s WHERE s.user_id = u.id AND s.expired_at > NOW()) as active_stories_count,
    (SELECT COUNT(*) FROM notifications n WHERE n.user_id = u.id AND n.is_read = 0) as unread_notifications_count,
    u.created_at,
    u.updated_at
FROM users u;

-- View untuk post dengan detail lengkap
CREATE OR REPLACE VIEW posts_detailed AS
SELECT 
    p.id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar as user_avatar,
    u.is_verified as user_verified,
    p.content,
    p.media_urls,
    p.media_type,
    p.hashtags,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.views_count,
    p.is_pinned,
    p.created_at,
    p.updated_at
FROM posts p
JOIN users u ON p.user_id = u.id;

-- View untuk trending hashtags
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT 
    h.id,
    h.name,
    h.posts_count,
    h.trending_score,
    h.last_used_at,
    CASE 
        WHEN h.last_used_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 'hot'
        WHEN h.last_used_at >= DATE_SUB(NOW(), INTERVAL 3 DAY) THEN 'trending'
        WHEN h.last_used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'active'
        ELSE 'cold'
    END as status
FROM hashtags h
WHERE h.posts_count > 0
ORDER BY h.trending_score DESC, h.posts_count DESC;

-- ===================================================================
-- INITIAL DATA INTEGRITY CHECKS
-- ===================================================================

-- Pastikan semua user punya user_settings
INSERT IGNORE INTO user_settings (user_id, created_at, updated_at)
SELECT u.id, NOW(), NOW()
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.id IS NULL;

-- Pastikan expired_at di stories ter-set dengan benar
UPDATE stories 
SET expired_at = DATE_ADD(created_at, INTERVAL 24 HOUR)
WHERE expired_at IS NULL;

-- Update last_used_at untuk hashtags yang ada di post_hashtags
UPDATE hashtags h
SET last_used_at = (
    SELECT MAX(p.created_at)
    FROM post_hashtags ph
    JOIN posts p ON ph.post_id = p.id
    WHERE ph.hashtag_id = h.id
)
WHERE EXISTS (
    SELECT 1 FROM post_hashtags ph2 WHERE ph2.hashtag_id = h.id
);

-- Jalankan update trending scores awal
CALL UpdateTrendingScores();

-- ===================================================================
-- LOG MIGRASI SELESAI
-- ===================================================================

INSERT IGNORE INTO migrations (migration, batch, ran_at) VALUES
('016_create_procedures', 2, NOW()),
('017_create_views', 2, NOW()),
('018_data_integrity_check', 2, NOW()),
('019_initial_trending_update', 2, NOW());

-- ===================================================================
-- SELESAI MIGRATIONS
-- ===================================================================