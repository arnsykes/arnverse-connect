-- ===================================================================
-- ARNVERSE Data Seed (Aman untuk Shared Hosting)
-- File: 01_seed.sql
-- 
-- PETUNJUK IMPORT:
-- 1. Impor file ini SETELAH 00_schema.sql sudah sukses
-- 2. Pastikan database sudah dipilih di phpMyAdmin (JANGAN pakai CREATE DATABASE/USE)
-- 3. File ini aman dijalankan berulang (idempotent)
-- 4. Urutan impor: 00_schema.sql → 01_seed.sql → 02_migrations.sql
-- 
-- SOLUSI ERROR #1442:
-- - Tidak ada subquery ke tabel users di dalam INSERT VALUES
-- - Menggunakan variabel session (@var) untuk menyimpan ID
-- - Transaksi aman dengan FK checks sementara dinonaktifkan
-- ===================================================================

-- Simpan setting FK dan nonaktifkan sementara
SET @OLD_FK_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Mulai transaksi
START TRANSACTION;

-- ===================================================================
-- 1. HASHTAGS POPULER
-- ===================================================================
INSERT IGNORE INTO hashtags (name, posts_count, trending_score, last_used_at, created_at) VALUES
('#arnverse', 0, 85.50, NOW(), NOW()),
('#teknologi', 0, 72.30, NOW(), NOW()),
('#programming', 0, 68.90, NOW(), NOW()),
('#indonesia', 0, 75.20, NOW(), NOW()),
('#tutorial', 0, 65.10, NOW(), NOW()),
('#webdev', 0, 70.80, NOW(), NOW()),
('#react', 0, 66.40, NOW(), NOW()),
('#php', 0, 58.30, NOW(), NOW()),
('#sosmed', 0, 71.60, NOW(), NOW()),
('#coding', 0, 63.70, NOW(), NOW()),
('#design', 0, 74.10, NOW(), NOW()),
('#uiux', 0, 69.50, NOW(), NOW()),
('#trends2024', 0, 67.80, NOW(), NOW());

-- ===================================================================
-- 2. USER DEMO (Password: "password" untuk semua user)
-- ===================================================================
-- Hash bcrypt untuk password "password": $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT IGNORE INTO users (
    username, email, password_hash, display_name, bio, avatar, 
    is_verified, is_private, is_exclusive, is_admin,
    created_at, updated_at
) VALUES 
(
    'alice_cosmic', 
    'alice@arnverse.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Alice Cooper', 
    'Tech enthusiast & ARNVERSE early adopter 🚀\nSuka coding dan berbagi tips teknologi!',
    NULL,
    1, 0, 0, 0,
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    NOW()
),
(
    'bob_dev', 
    'dev@arnverse.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Bob Developer', 
    'Full-stack developer 💻\nMembangun masa depan dengan kode',
    NULL,
    0, 0, 0, 0,
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
    1, 0, 0, 0,
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
);

-- ===================================================================
-- 3. AMBIL USER ID KE VARIABEL (SOLUSI ERROR #1442)
-- ===================================================================
SELECT id INTO @u_alice FROM users WHERE email = 'alice@arnverse.com' LIMIT 1;
SELECT id INTO @u_bob FROM users WHERE email = 'dev@arnverse.com' LIMIT 1;
SELECT id INTO @u_charlie FROM users WHERE email = 'charlie@arnverse.com' LIMIT 1;

-- ===================================================================
-- 4. USER SETTINGS
-- ===================================================================
INSERT IGNORE INTO user_settings (user_id, privacy_level, notifications_enabled, theme, created_at, updated_at) VALUES
(@u_alice, 'public', 1, 'auto', NOW(), NOW()),
(@u_bob, 'public', 1, 'dark', NOW(), NOW()),
(@u_charlie, 'public', 1, 'light', NOW(), NOW());

-- ===================================================================
-- 5. POSTS DEMO
-- ===================================================================
INSERT IGNORE INTO posts (user_id, content, hashtags, created_at, updated_at) VALUES
(
    @u_alice,
    'Selamat datang di ARNVERSE! 🎉\n\nPlatform sosial media baru yang dikembangkan dengan teknologi modern. Mari kita membangun komunitas yang positif dan saling mendukung!\n\n#arnverse #teknologi #sosmed',
    '#arnverse #teknologi #sosmed',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NOW()
),
(
    @u_bob,
    'Tips untuk developer pemula:\n\n1. Konsisten dalam belajar 📚\n2. Practice makes perfect 💪\n3. Jangan takut bertanya ❓\n4. Build projects, not just tutorials 🏗️\n5. Join komunitas developer 👥\n\nApa tips kalian? Share di comment! 👇\n\n#programming #tutorial #webdev',
    '#programming #tutorial #webdev',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    NOW()
),
(
    @u_charlie,
    'UI/UX Design trends 2024 yang perlu diperhatikan:\n\n✨ Minimalist design\n🎨 Bold color combinations\n🔤 Custom typography\n📱 Mobile-first approach\n♿ Accessibility focus\n\nDesign bukan hanya tentang keindahan, tapi juga pengalaman pengguna!\n\n#design #uiux #trends2024',
    '#design #uiux #trends2024',
    DATE_SUB(NOW(), INTERVAL 6 HOUR),
    NOW()
);

-- ===================================================================
-- 6. AMBIL POST ID KE VARIABEL
-- ===================================================================
SELECT id INTO @p_alice_1 FROM posts WHERE user_id = @u_alice ORDER BY id LIMIT 1;
SELECT id INTO @p_bob_1 FROM posts WHERE user_id = @u_bob ORDER BY id LIMIT 1;
SELECT id INTO @p_charlie_1 FROM posts WHERE user_id = @u_charlie ORDER BY id LIMIT 1;

-- ===================================================================
-- 7. AMBIL HASHTAG ID KE VARIABEL
-- ===================================================================
SELECT id INTO @h_arnverse FROM hashtags WHERE name = '#arnverse' LIMIT 1;
SELECT id INTO @h_teknologi FROM hashtags WHERE name = '#teknologi' LIMIT 1;
SELECT id INTO @h_sosmed FROM hashtags WHERE name = '#sosmed' LIMIT 1;
SELECT id INTO @h_programming FROM hashtags WHERE name = '#programming' LIMIT 1;
SELECT id INTO @h_tutorial FROM hashtags WHERE name = '#tutorial' LIMIT 1;
SELECT id INTO @h_webdev FROM hashtags WHERE name = '#webdev' LIMIT 1;
SELECT id INTO @h_design FROM hashtags WHERE name = '#design' LIMIT 1;
SELECT id INTO @h_uiux FROM hashtags WHERE name = '#uiux' LIMIT 1;
SELECT id INTO @h_trends2024 FROM hashtags WHERE name = '#trends2024' LIMIT 1;

-- ===================================================================
-- 8. FOLLOW RELATIONSHIPS (MENGGUNAKAN VARIABEL)
-- ===================================================================
INSERT IGNORE INTO follows (follower_id, following_id, created_at) VALUES
(@u_alice, @u_bob, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@u_alice, @u_charlie, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@u_bob, @u_alice, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@u_bob, @u_charlie, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@u_charlie, @u_alice, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(@u_charlie, @u_bob, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ===================================================================
-- 9. COMMENTS DEMO
-- ===================================================================
INSERT IGNORE INTO comments (post_id, user_id, content, created_at, updated_at) VALUES
(@p_alice_1, @u_bob, 'Keren banget Alice! Sudah ditunggu-tunggu platform seperti ini 🔥', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(@p_alice_1, @u_charlie, 'UI-nya clean banget, good job team! 👏', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(@p_alice_1, @u_alice, 'Terima kasih supportnya guys! Masih banyak fitur keren yang akan datang ✨', DATE_SUB(NOW(), INTERVAL 20 HOUR), NOW()),
(@p_bob_1, @u_alice, 'Tips nomor 4 paling penting! Build real projects memang beda feelnya', DATE_SUB(NOW(), INTERVAL 12 HOUR), NOW()),
(@p_bob_1, @u_charlie, 'Setuju! Dan jangan lupa dokumentasi yang baik juga penting 📝', DATE_SUB(NOW(), INTERVAL 10 HOUR), NOW()),
(@p_charlie_1, @u_alice, 'Accessibility focus 👆 ini yang sering dilupakan developer!', DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW()),
(@p_charlie_1, @u_bob, 'Dark mode juga trending banget sekarang 🌙', DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW());

-- ===================================================================
-- 10. LIKES DEMO (MENGGUNAKAN VARIABEL)
-- ===================================================================
INSERT IGNORE INTO likes (user_id, post_id, created_at) VALUES
-- Likes untuk post Alice
(@u_bob, @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@u_charlie, @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Likes untuk post Bob
(@u_alice, @p_bob_1, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@u_charlie, @p_bob_1, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
-- Likes untuk post Charlie
(@u_alice, @p_charlie_1, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@u_bob, @p_charlie_1, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ===================================================================
-- 11. POST-HASHTAG RELATIONSHIPS (MENGGUNAKAN VARIABEL)
-- ===================================================================
INSERT IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES
(@p_alice_1, @h_arnverse),
(@p_alice_1, @h_teknologi),
(@p_alice_1, @h_sosmed),
(@p_bob_1, @h_programming),
(@p_bob_1, @h_tutorial),
(@p_bob_1, @h_webdev),
(@p_charlie_1, @h_design),
(@p_charlie_1, @h_uiux),
(@p_charlie_1, @h_trends2024);

-- ===================================================================
-- 12. STORIES DEMO (BELUM EXPIRED)
-- ===================================================================
INSERT IGNORE INTO stories (user_id, media_url, media_type, content, duration, expired_at, created_at) VALUES
(
    @u_alice,
    '/api/uploads/story_alice_1.jpg',
    'image',
    'Working on new features! 💻✨',
    5,
    DATE_ADD(NOW(), INTERVAL 20 HOUR),
    DATE_SUB(NOW(), INTERVAL 4 HOUR)
),
(
    @u_bob,
    '/api/uploads/story_bob_1.jpg', 
    'image',
    'Coffee time ☕ Ready to code!',
    5,
    DATE_ADD(NOW(), INTERVAL 18 HOUR),
    DATE_SUB(NOW(), INTERVAL 6 HOUR)
),
(
    @u_charlie,
    '/api/uploads/story_charlie_1.jpg',
    'image', 
    'New design mockup in progress 🎨',
    5,
    DATE_ADD(NOW(), INTERVAL 22 HOUR),
    DATE_SUB(NOW(), INTERVAL 2 HOUR)
);

-- ===================================================================
-- 13. AMBIL STORY ID DAN BUAT STORY VIEWS
-- ===================================================================
SELECT id INTO @s_alice FROM stories WHERE user_id = @u_alice ORDER BY id LIMIT 1;
SELECT id INTO @s_bob FROM stories WHERE user_id = @u_bob ORDER BY id LIMIT 1;
SELECT id INTO @s_charlie FROM stories WHERE user_id = @u_charlie ORDER BY id LIMIT 1;

INSERT IGNORE INTO story_views (story_id, user_id, created_at) VALUES
(@s_alice, @u_bob, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(@s_alice, @u_charlie, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@s_bob, @u_alice, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(@s_bob, @u_charlie, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@s_charlie, @u_alice, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@s_charlie, @u_bob, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- ===================================================================
-- 14. BOOKMARKS DEMO
-- ===================================================================
INSERT IGNORE INTO bookmarks (user_id, post_id, created_at) VALUES
(@u_alice, @p_bob_1, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@u_bob, @p_charlie_1, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@u_charlie, @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ===================================================================
-- 15. CHAT DEMO (DM BASIC)
-- ===================================================================
INSERT IGNORE INTO chats (type, participants_count, created_at, updated_at) VALUES
('dm', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
('group', 3, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- Ambil chat ID
SELECT id INTO @chat_dm FROM chats WHERE type = 'dm' ORDER BY id LIMIT 1;
SELECT id INTO @chat_group FROM chats WHERE type = 'group' ORDER BY id LIMIT 1;

-- Chat participants
INSERT IGNORE INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at) VALUES
(@chat_dm, @u_alice, 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@chat_dm, @u_bob, 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@chat_group, @u_alice, 'admin', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(@chat_group, @u_bob, 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(@chat_group, @u_charlie, 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- Messages demo
INSERT IGNORE INTO messages (chat_id, user_id, content, created_at, updated_at) VALUES
(@chat_dm, @u_alice, 'Hey Bob! Gimana kabar project terbarunya?', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@chat_dm, @u_bob, 'Hi Alice! Alhamdulillah lancar, lagi fokus di backend API nih', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@chat_dm, @u_alice, 'Keren! Kalau butuh bantuan testing atau feedback UI jangan sungkan ya 😊', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@chat_dm, @u_bob, 'Siap! Makasih Alice, nanti ku share progress-nya', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Public chat messages demo
INSERT IGNORE INTO public_chat_messages (user_id, content, created_at) VALUES
(@u_alice, 'Halo semua! Welcome to ARNVERSE public chat 👋', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(@u_bob, 'Hi Alice! Excited to be here 🚀', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@u_charlie, 'The design looks amazing! Great work team ✨', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(@u_alice, 'Thanks everyone! Jangan lupa share feedback kalau ada suggestions 💡', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- ===================================================================
-- 16. NOTIFICATIONS DEMO
-- ===================================================================
INSERT IGNORE INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at) VALUES
(@u_alice, @u_bob, 'like', 'post', @p_alice_1, 'Bob Developer menyukai post Anda', 'Post: "Selamat datang di ARNVERSE! 🎉"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@u_alice, @u_charlie, 'comment', 'post', @p_alice_1, 'Charlie Designer berkomentar di post Anda', 'Komentar: "UI-nya clean banget, good job team! 👏"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@u_alice, @u_bob, 'follow', 'user', @u_alice, 'Bob Developer mulai mengikuti Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@u_bob, @u_alice, 'like', 'post', @p_bob_1, 'Alice Cooper menyukai post Anda', 'Post: "Tips untuk developer pemula"', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(@u_charlie, @u_alice, 'story_view', 'story', @s_charlie, 'Alice Cooper melihat story Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ===================================================================
-- 17. RECOUNT AMAN AGREGAT (TANPA SUBQUERY TRIGGER-PRONE)
-- ===================================================================

-- Update posts_count di users
UPDATE users u SET posts_count = (
    SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id
);

-- Update likes_count di posts  
UPDATE posts p SET likes_count = (
    SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
);

-- Update comments_count di posts
UPDATE posts p SET comments_count = (
    SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
);

-- Update views_count di stories
UPDATE stories s SET views_count = (
    SELECT COUNT(*) FROM story_views sv WHERE sv.story_id = s.id
);

-- Update followers_count di users
UPDATE users u SET followers_count = (
    SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id
);

-- Update following_count di users
UPDATE users u SET following_count = (
    SELECT COUNT(*) FROM follows f WHERE f.follower_id = u.id
);

-- Update posts_count di hashtags
UPDATE hashtags h SET posts_count = (
    SELECT COUNT(*) FROM post_hashtags ph WHERE ph.hashtag_id = h.id
);

-- ===================================================================
-- 18. SELESAI - COMMIT DAN RESTORE FK
-- ===================================================================

COMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FK_CHECKS;

-- ===================================================================
-- SEED DATA SELESAI
-- 
-- TESTING CEPAT:
-- 1. SELECT COUNT(*) FROM users;           -- Harus ada 3 user
-- 2. SELECT COUNT(*) FROM posts;           -- Harus ada 3 post
-- 3. SELECT COUNT(*) FROM follows;         -- Harus ada 6 follow
-- 4. SELECT COUNT(*) FROM likes;           -- Harus ada 6 like
-- 5. SELECT COUNT(*) FROM hashtags;        -- Harus ada 13 hashtag
-- 
-- LOGIN TEST:
-- Email: alice@arnverse.com
-- Password: password
-- ===================================================================