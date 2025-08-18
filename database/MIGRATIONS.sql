-- ARNVERSE Database Migrations
-- Version control and incremental updates

-- Migration tracking
INSERT INTO migrations (migration, batch) VALUES 
('001_create_core_tables', 1),
('002_create_engagement_system', 1),
('003_create_messaging_system', 1),
('004_create_notifications', 1),
('005_create_hashtags_system', 1),
('006_create_moderation_system', 1),
('007_create_triggers', 1);

-- Insert default system settings
INSERT INTO system_settings (`key`, `value`, `type`, `description`) VALUES 
('site_name', 'ARNVERSE', 'string', 'Application name'),
('max_upload_size', '10485760', 'integer', 'Maximum file upload size in bytes (10MB)'),
('story_duration', '86400', 'integer', 'Story expiration time in seconds (24 hours)'),
('max_video_duration', '60', 'integer', 'Maximum video duration in seconds'),
('username_change_cooldown', '604800', 'integer', 'Username change cooldown in seconds (7 days)'),
('enable_registration', 'true', 'boolean', 'Allow new user registration'),
('maintenance_mode', 'false', 'boolean', 'Site maintenance mode'),
('default_language', 'en', 'string', 'Default application language'),
('posts_per_page', '20', 'integer', 'Number of posts per page in feed'),
('stories_expiry_check', '3600', 'integer', 'How often to check for expired stories (seconds)');

-- Create default hashtags
INSERT INTO hashtags (name, posts_count, trending_score) VALUES 
('ARNVERSE', 0, 10.0),
('CosmicVibes', 0, 8.5),
('SpaceExploration', 0, 7.2),
('DigitalArt', 0, 6.8),
('TechInnovation', 0, 5.9),
('Photography', 0, 5.5),
('Music', 0, 5.2),
('Travel', 0, 4.8),
('Inspiration', 0, 4.5),
('Community', 0, 4.2);

-- =================================================
-- MIGRATION 008: Add indexes for performance
-- =================================================

-- Additional performance indexes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_stories_user_expires ON stories(user_id, expires_at DESC);
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at, created_at DESC);

-- =================================================
-- MIGRATION 009: Full-text search improvements
-- =================================================

-- Add full-text search for better search functionality
ALTER TABLE users ADD FULLTEXT KEY idx_user_search (username, display_name, bio);
ALTER TABLE hashtags ADD FULLTEXT KEY idx_hashtag_search (name);

-- =================================================
-- MIGRATION 010: Story highlights feature
-- =================================================

CREATE TABLE `story_highlights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `highlight_stories` (
  `highlight_id` int(11) NOT NULL,
  `story_id` int(11) NOT NULL,
  `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`highlight_id`, `story_id`),
  FOREIGN KEY (`highlight_id`) REFERENCES `story_highlights`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================
-- MIGRATION 011: Content scheduling
-- =================================================

CREATE TABLE `scheduled_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `media_urls` json DEFAULT NULL,
  `hashtags` json DEFAULT NULL,
  `mentions` json DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `scheduled_for` timestamp NOT NULL,
  `status` enum('pending','published','failed','cancelled') DEFAULT 'pending',
  `attempts` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_scheduled_for` (`scheduled_for`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================
-- MIGRATION 012: Analytics tables
-- =================================================

CREATE TABLE `post_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `views` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `comments` int(11) DEFAULT 0,
  `shares` int(11) DEFAULT 0,
  `saves` int(11) DEFAULT 0,
  `reach` int(11) DEFAULT 0,
  `impressions` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_post_date` (`post_id`, `date`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `story_analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `story_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `views` int(11) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `shares` int(11) DEFAULT 0,
  `completion_rate` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_story_date` (`story_id`, `date`),
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update migrations log
INSERT INTO migrations (migration, batch) VALUES 
('008_performance_indexes', 2),
('009_fulltext_search', 2),
('010_story_highlights', 2),
('011_content_scheduling', 2),
('012_analytics_tables', 2);

-- =================================================
-- DATA CLEANUP PROCEDURES
-- =================================================

-- Procedure to clean expired stories
DELIMITER $$
CREATE PROCEDURE CleanExpiredStories()
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END$$
DELIMITER ;

-- Procedure to clean old notifications (keep 30 days)
DELIMITER $$
CREATE PROCEDURE CleanOldNotifications()
BEGIN
  DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$
DELIMITER ;

-- Procedure to clean old sessions (keep 7 days)
DELIMITER $$
CREATE PROCEDURE CleanOldSessions()
BEGIN
  DELETE FROM user_sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 7 DAY);
END$$
DELIMITER ;

-- Procedure to update trending scores
DELIMITER $$
CREATE PROCEDURE UpdateTrendingScores()
BEGIN
  UPDATE hashtags 
  SET trending_score = CASE 
    WHEN last_used_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN posts_count * 2.0
    WHEN last_used_at >= DATE_SUB(NOW(), INTERVAL 3 DAY) THEN posts_count * 1.5
    WHEN last_used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN posts_count * 1.2
    ELSE posts_count * 0.8
  END;
END$$
DELIMITER ;