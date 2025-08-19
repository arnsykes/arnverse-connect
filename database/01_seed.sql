-- ===================================================================
-- ARNVERSE Seed Data (Shared Hosting Safe)
-- File: 01_seed.sql
-- 
-- PETUNJUK IMPORT:
-- 1. Pastikan 00_schema.sql sudah diimport tanpa error
-- 2. Import file ini untuk data demo/testing
-- 3. File ini AMAN dijalankan berulang (idempotent)
-- ===================================================================

-- Default hashtags populer
INSERT IGNORE INTO hashtags (name, posts_count, trending_score, last_used_at, created_at) VALUES
('#arnverse', 5, 85.50, NOW(), NOW()),
('#teknologi', 3, 72.30, NOW(), NOW()),
('#programming', 2, 68.90, NOW(), NOW()),
('#indonesia', 4, 75.20, NOW(), NOW()),
('#tutorial', 2, 65.10, NOW(), NOW()),
('#webdev', 3, 70.80, NOW(), NOW()),
('#react', 2, 66.40, NOW(), NOW()),
('#php', 1, 58.30, NOW(), NOW()),
('#sosmed', 3, 71.60, NOW(), NOW()),
('#coding', 2, 63.70, NOW(), NOW());

-- User demo untuk testing
-- Password untuk semua user: "password" (hash bcrypt)
INSERT IGNORE INTO users (
    username, email, password_hash, display_name, bio, avatar, 
    is_verified, posts_count, followers_count, following_count,
    created_at, updated_at
) VALUES 
(
    'alice', 
    'alice@arnverse.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Alice Cooper', 
    'Tech enthusiast & ARNVERSE early adopter 🚀\nSuka coding dan berbagi tips teknologi!',
    NULL,
    1, 
    3, 
    150, 
    89,
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    NOW()
),
(
    'bob_dev', 
    'bob@arnverse.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Bob Developer', 
    'Full-stack developer 💻\nMembangun masa depan dengan kode',
    NULL,
    0, 
    2, 
    75, 
    120,
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
),
(
    'charlie_ui', 
    'charlie@arnverse.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Charlie Designer', 
    'UI/UX Designer ✨\nMembuat pengalaman digital yang indah',
    NULL,
    1, 
    2, 
    95, 
    67,
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
);

-- User settings untuk semua user demo
INSERT IGNORE INTO user_settings (user_id, privacy_level, notifications_enabled, theme, created_at, updated_at) VALUES
((SELECT id FROM users WHERE username = 'alice'), 'public', 1, 'auto', NOW(), NOW()),
((SELECT id FROM users WHERE username = 'bob_dev'), 'public', 1, 'dark', NOW(), NOW()),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'public', 1, 'light', NOW(), NOW());

-- Follow relationships (saling follow untuk testing)
INSERT IGNORE INTO follows (follower_id, following_id, created_at) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM users WHERE username = 'bob_dev'), DATE_SUB(NOW(), INTERVAL 5 DAY)),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM users WHERE username = 'charlie_ui'), DATE_SUB(NOW(), INTERVAL 3 DAY)),
((SELECT id FROM users WHERE username = 'bob_dev'), (SELECT id FROM users WHERE username = 'alice'), DATE_SUB(NOW(), INTERVAL 4 DAY)),
((SELECT id FROM users WHERE username = 'bob_dev'), (SELECT id FROM users WHERE username = 'charlie_ui'), DATE_SUB(NOW(), INTERVAL 2 DAY)),
((SELECT id FROM users WHERE username = 'charlie_ui'), (SELECT id FROM users WHERE username = 'alice'), DATE_SUB(NOW(), INTERVAL 6 DAY)),
((SELECT id FROM users WHERE username = 'charlie_ui'), (SELECT id FROM users WHERE username = 'bob_dev'), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Posts demo untuk testing feed
INSERT IGNORE INTO posts (id, user_id, content, hashtags, likes_count, comments_count, views_count, created_at, updated_at) VALUES
(1, 
 (SELECT id FROM users WHERE username = 'alice'), 
 'Selamat datang di ARNVERSE! 🎉\n\nPlatform sosial media baru yang dikembangkan dengan teknologi modern. Mari kita membangun komunitas yang positif dan saling mendukung!\n\n#arnverse #teknologi #sosmed',
 '#arnverse #teknologi #sosmed',
 12, 3, 45,
 DATE_SUB(NOW(), INTERVAL 2 DAY),
 NOW()
),
(2,
 (SELECT id FROM users WHERE username = 'bob_dev'),
 'Tips untuk developer pemula:\n\n1. Konsisten dalam belajar 📚\n2. Practice makes perfect 💪\n3. Jangan takut bertanya ❓\n4. Build projects, not just tutorials 🏗️\n5. Join komunitas developer 👥\n\nApa tips kalian? Share di comment! 👇\n\n#programming #tutorial #webdev',
 '#programming #tutorial #webdev',
 8, 5, 32,
 DATE_SUB(NOW(), INTERVAL 1 DAY),
 NOW()
),
(3,
 (SELECT id FROM users WHERE username = 'charlie_ui'),
 'UI/UX Design trends 2024 yang perlu diperhatikan:\n\n✨ Minimalist design\n🎨 Bold color combinations\n🔤 Custom typography\n📱 Mobile-first approach\n♿ Accessibility focus\n\nDesign bukan hanya tentang keindahan, tapi juga pengalaman pengguna!\n\n#design #uiux #trends2024',
 '#design #uiux #trends2024',
 15, 2, 67,
 DATE_SUB(NOW(), INTERVAL 6 HOUR),
 NOW()
);

-- Comments demo
INSERT IGNORE INTO comments (id, post_id, user_id, content, likes_count, created_at, updated_at) VALUES
(1, 1, (SELECT id FROM users WHERE username = 'bob_dev'), 'Keren banget Alice! Sudah ditunggu-tunggu platform seperti ini 🔥', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(2, 1, (SELECT id FROM users WHERE username = 'charlie_ui'), 'UI-nya clean banget, good job team! 👏', 3, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, 1, (SELECT id FROM users WHERE username = 'alice'), 'Terima kasih supportnya guys! Masih banyak fitur keren yang akan datang ✨', 1, DATE_SUB(NOW(), INTERVAL 20 HOUR), NOW()),
(4, 2, (SELECT id FROM users WHERE username = 'alice'), 'Tips nomor 4 paling penting! Build real projects memang beda feelnya', 1, DATE_SUB(NOW(), INTERVAL 12 HOUR), NOW()),
(5, 2, (SELECT id FROM users WHERE username = 'charlie_ui'), 'Setuju! Dan jangan lupa dokumentasi yang baik juga penting 📝', 0, DATE_SUB(NOW(), INTERVAL 10 HOUR), NOW()),
(6, 3, (SELECT id FROM users WHERE username = 'alice'), 'Accessibility focus 👆 ini yang sering dilupakan developer!', 1, DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW()),
(7, 3, (SELECT id FROM users WHERE username = 'bob_dev'), 'Dark mode juga trending banget sekarang 🌙', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW());

-- Likes demo
INSERT IGNORE INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES
-- Likes untuk post 1
((SELECT id FROM users WHERE username = 'bob_dev'), 'post', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'post', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Likes untuk post 2  
((SELECT id FROM users WHERE username = 'alice'), 'post', 2, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'post', 2, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
-- Likes untuk post 3
((SELECT id FROM users WHERE username = 'alice'), 'post', 3, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
((SELECT id FROM users WHERE username = 'bob_dev'), 'post', 3, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
-- Likes untuk comments
((SELECT id FROM users WHERE username = 'alice'), 'comment', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'comment', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'bob_dev'), 'comment', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'alice'), 'comment', 2, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
((SELECT id FROM users WHERE username = 'bob_dev'), 'comment', 2, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
((SELECT id FROM users WHERE username = 'bob_dev'), 'comment', 4, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'comment', 6, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Post-Hashtag relationships
INSERT IGNORE INTO post_hashtags (post_id, hashtag_id, created_at) VALUES
(1, (SELECT id FROM hashtags WHERE name = '#arnverse'), NOW()),
(1, (SELECT id FROM hashtags WHERE name = '#teknologi'), NOW()),
(1, (SELECT id FROM hashtags WHERE name = '#sosmed'), NOW()),
(2, (SELECT id FROM hashtags WHERE name = '#programming'), NOW()),
(2, (SELECT id FROM hashtags WHERE name = '#tutorial'), NOW()),
(2, (SELECT id FROM hashtags WHERE name = '#webdev'), NOW()),
(3, (SELECT id FROM hashtags WHERE name = '#teknologi'), NOW());

-- Stories demo (yang belum expired)
INSERT IGNORE INTO stories (id, user_id, media_url, media_type, content, duration, views_count, likes_count, expired_at, created_at) VALUES
(1,
 (SELECT id FROM users WHERE username = 'alice'),
 '/api/uploads/story_alice_1.jpg',
 'image',
 'Working on new features! 💻✨',
 5,
 23, 8,
 DATE_ADD(NOW(), INTERVAL 20 HOUR),
 DATE_SUB(NOW(), INTERVAL 4 HOUR)
),
(2,
 (SELECT id FROM users WHERE username = 'bob_dev'),
 '/api/uploads/story_bob_1.jpg', 
 'image',
 'Coffee time ☕ Ready to code!',
 5,
 15, 5,
 DATE_ADD(NOW(), INTERVAL 18 HOUR),
 DATE_SUB(NOW(), INTERVAL 6 HOUR)
),
(3,
 (SELECT id FROM users WHERE username = 'charlie_ui'),
 '/api/uploads/story_charlie_1.jpg',
 'image', 
 'New design mockup in progress 🎨',
 5,
 19, 7,
 DATE_ADD(NOW(), INTERVAL 22 HOUR),
 DATE_SUB(NOW(), INTERVAL 2 HOUR)
);

-- Story views
INSERT IGNORE INTO story_views (story_id, user_id, created_at) VALUES
(1, (SELECT id FROM users WHERE username = 'bob_dev'), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, (SELECT id FROM users WHERE username = 'charlie_ui'), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, (SELECT id FROM users WHERE username = 'alice'), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, (SELECT id FROM users WHERE username = 'charlie_ui'), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, (SELECT id FROM users WHERE username = 'alice'), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, (SELECT id FROM users WHERE username = 'bob_dev'), DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- Bookmarks demo
INSERT IGNORE INTO bookmarks (user_id, post_id, created_at) VALUES
((SELECT id FROM users WHERE username = 'alice'), 2, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
((SELECT id FROM users WHERE username = 'bob_dev'), 3, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Chat demo (DM antara Alice dan Bob)
INSERT IGNORE INTO chats (id, type, participants_count, created_at, updated_at) VALUES
(1, 'dm', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(2, 'group', 3, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- Chat participants
INSERT IGNORE INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at) VALUES
(1, (SELECT id FROM users WHERE username = 'alice'), 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, (SELECT id FROM users WHERE username = 'bob_dev'), 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, (SELECT id FROM users WHERE username = 'alice'), 'admin', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, (SELECT id FROM users WHERE username = 'bob_dev'), 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(2, (SELECT id FROM users WHERE username = 'charlie_ui'), 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- Messages demo
INSERT IGNORE INTO messages (id, chat_id, user_id, content, created_at, updated_at) VALUES
(1, 1, (SELECT id FROM users WHERE username = 'alice'), 'Hey Bob! Gimana kabar project terbarunya?', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, (SELECT id FROM users WHERE username = 'bob_dev'), 'Hi Alice! Alhamdulillah lancar, lagi fokus di backend API nih', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, (SELECT id FROM users WHERE username = 'alice'), 'Keren! Kalau butuh bantuan testing atau feedback UI jangan sungkan ya 😊', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 1, (SELECT id FROM users WHERE username = 'bob_dev'), 'Siap! Makasih Alice, nanti ku share progress-nya', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 2, (SELECT id FROM users WHERE username = 'alice'), 'Halo tim! Ada yang bisa bantu review design system yang baru?', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 2, (SELECT id FROM users WHERE username = 'charlie_ui'), 'Sure Alice! Kirim aja link Figma-nya', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 2, (SELECT id FROM users WHERE username = 'bob_dev'), 'Aku juga mau liat, terutama component librarynya', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Update last_message_id dan last_message_at di chats
UPDATE chats SET 
    last_message_id = 4, 
    last_message_at = (SELECT created_at FROM messages WHERE id = 4) 
WHERE id = 1;

UPDATE chats SET 
    last_message_id = 7, 
    last_message_at = (SELECT created_at FROM messages WHERE id = 7) 
WHERE id = 2;

-- Public chat messages demo
INSERT IGNORE INTO public_chat_messages (user_id, content, created_at) VALUES
((SELECT id FROM users WHERE username = 'alice'), 'Halo semua! Welcome to ARNVERSE public chat 👋', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
((SELECT id FROM users WHERE username = 'bob_dev'), 'Hi Alice! Excited to be here 🚀', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
((SELECT id FROM users WHERE username = 'charlie_ui'), 'The design looks amazing! Great work team ✨', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
((SELECT id FROM users WHERE username = 'alice'), 'Thanks everyone! Jangan lupa share feedback kalau ada suggestions 💡', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- Notifications demo
INSERT IGNORE INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at) VALUES
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM users WHERE username = 'bob_dev'), 'like', 'post', 1, 'Bob Developer menyukai post Anda', 'Post: "Selamat datang di ARNVERSE! 🎉"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM users WHERE username = 'charlie_ui'), 'comment', 'post', 1, 'Charlie Designer berkomentar di post Anda', 'Komentar: "UI-nya clean banget, good job team! 👏"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
((SELECT id FROM users WHERE username = 'alice'), (SELECT id FROM users WHERE username = 'bob_dev'), 'follow', 'user', (SELECT id FROM users WHERE username = 'alice'), 'Bob Developer mulai mengikuti Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
((SELECT id FROM users WHERE username = 'bob_dev'), (SELECT id FROM users WHERE username = 'alice'), 'like', 'post', 2, 'Alice Cooper menyukai post Anda', 'Post: "Tips untuk developer pemula"', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
((SELECT id FROM users WHERE username = 'charlie_ui'), (SELECT id FROM users WHERE username = 'alice'), 'story_view', 'story', 1, 'Alice Cooper melihat story Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ===================================================================
-- UPDATE COUNTER MANUAL (jika trigger belum berjalan)
-- ===================================================================

-- Update posts_count di users berdasarkan data sebenarnya
UPDATE users SET posts_count = (
    SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id
);

-- Update likes_count di posts berdasarkan data sebenarnya  
UPDATE posts SET likes_count = (
    SELECT COUNT(*) FROM likes WHERE likes.likeable_type = 'post' AND likes.likeable_id = posts.id
);

-- Update comments_count di posts berdasarkan data sebenarnya
UPDATE posts SET comments_count = (
    SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id
);

-- Update views_count di stories berdasarkan data sebenarnya
UPDATE stories SET views_count = (
    SELECT COUNT(*) FROM story_views WHERE story_views.story_id = stories.id
);

-- Update followers_count dan following_count di users
UPDATE users SET followers_count = (
    SELECT COUNT(*) FROM follows WHERE follows.following_id = users.id
);

UPDATE users SET following_count = (
    SELECT COUNT(*) FROM follows WHERE follows.follower_id = users.id
);

-- Update posts_count di hashtags berdasarkan data sebenarnya
UPDATE hashtags SET posts_count = (
    SELECT COUNT(*) FROM post_hashtags WHERE post_hashtags.hashtag_id = hashtags.id
);

-- ===================================================================
-- SELESAI SEED DATA
-- ===================================================================