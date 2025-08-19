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
INSERT INTO hashtags (name, posts_count, trending_score, last_used_at, created_at) VALUES
('#arnverse', 0, 85.50, NOW(), NOW()),
('#teknologi', 0, 72.30, NOW(), NOW()),
('#programming', 0, 68.90, NOW(), NOW()),
('#indonesia', 0, 75.20, NOW(), NOW()),
('#react', 0, 66.40, NOW(), NOW()),
('#nextjs', 0, 64.10, NOW(), NOW()),
('#coding', 0, 63.70, NOW(), NOW()),
('#dev', 0, 69.80, NOW(), NOW()),
('#ai', 0, 78.60, NOW(), NOW()),
('#mobiledev', 0, 61.30, NOW(), NOW())
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), trending_score = VALUES(trending_score);

-- Ambil ID hashtag ke variabel
SELECT id INTO @h_arnverse FROM hashtags WHERE name = '#arnverse' LIMIT 1;
SELECT id INTO @h_teknologi FROM hashtags WHERE name = '#teknologi' LIMIT 1;
SELECT id INTO @h_programming FROM hashtags WHERE name = '#programming' LIMIT 1;
SELECT id INTO @h_indonesia FROM hashtags WHERE name = '#indonesia' LIMIT 1;
SELECT id INTO @h_react FROM hashtags WHERE name = '#react' LIMIT 1;
SELECT id INTO @h_nextjs FROM hashtags WHERE name = '#nextjs' LIMIT 1;
SELECT id INTO @h_coding FROM hashtags WHERE name = '#coding' LIMIT 1;
SELECT id INTO @h_dev FROM hashtags WHERE name = '#dev' LIMIT 1;
SELECT id INTO @h_ai FROM hashtags WHERE name = '#ai' LIMIT 1;
SELECT id INTO @h_mobiledev FROM hashtags WHERE name = '#mobiledev' LIMIT 1;

-- ===================================================================
-- 2. USER DEMO (Password: "password" untuk semua user)
-- ===================================================================
-- Hash bcrypt untuk password "password": $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (
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
)
ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), email = VALUES(email);

-- Ambil ID user ke variabel
SELECT id INTO @u_alice FROM users WHERE email = 'alice@arnverse.com' LIMIT 1;
SELECT id INTO @u_bob FROM users WHERE email = 'dev@arnverse.com' LIMIT 1;
SELECT id INTO @u_charlie FROM users WHERE email = 'charlie@arnverse.com' LIMIT 1;

-- ===================================================================
-- 3. USER SETTINGS
-- ===================================================================
INSERT INTO user_settings (user_id, privacy_level, notifications_enabled, theme, created_at, updated_at)
SELECT @u_alice, 'public', 1, 'auto', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = @u_alice);

INSERT INTO user_settings (user_id, privacy_level, notifications_enabled, theme, created_at, updated_at)
SELECT @u_bob, 'public', 1, 'dark', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = @u_bob);

INSERT INTO user_settings (user_id, privacy_level, notifications_enabled, theme, created_at, updated_at)
SELECT @u_charlie, 'public', 1, 'light', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = @u_charlie);

-- ===================================================================
-- 4. POSTS DEMO
-- ===================================================================
INSERT INTO posts (user_id, content, hashtags, media_type, created_at, updated_at)
SELECT @u_alice,
       'Selamat datang di ARNVERSE! 🎉\n\nPlatform sosial media baru yang dikembangkan dengan teknologi modern. Mari kita membangun komunitas yang positif dan saling mendukung!\n\n#arnverse #teknologi',
       '#arnverse #teknologi',
       'none',
       DATE_SUB(NOW(), INTERVAL 2 DAY),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE user_id = @u_alice 
    AND content LIKE '%Selamat datang di ARNVERSE%'
);

INSERT INTO posts (user_id, content, hashtags, media_type, media_urls, created_at, updated_at)
SELECT @u_alice,
       'Sharing foto workspace saya hari ini! Produktivitas maksimal dengan setup minimalis 💪 #coding #dev',
       '#coding #dev',
       'image',
       '["\/uploads\/demo\/alice_workspace.jpg"]',
       DATE_SUB(NOW(), INTERVAL 1 DAY),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE user_id = @u_alice 
    AND content LIKE '%workspace saya hari ini%'
);

INSERT INTO posts (user_id, content, hashtags, media_type, created_at, updated_at)
SELECT @u_bob,
       'Tips untuk developer pemula:\n\n1. Konsisten dalam belajar 📚\n2. Practice makes perfect 💪\n3. Jangan takut bertanya ❓\n4. Build projects, not just tutorials 🏗️\n5. Join komunitas developer 👥\n\nApa tips kalian? Share di comment! 👇\n\n#programming #indonesia',
       '#programming #indonesia',
       'none',
       DATE_SUB(NOW(), INTERVAL 18 HOUR),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE user_id = @u_bob 
    AND content LIKE '%Tips untuk developer pemula%'
);

INSERT INTO posts (user_id, content, hashtags, media_type, created_at, updated_at)
SELECT @u_charlie,
       'React vs Next.js untuk project baru? 🤔\n\nSetelah coba keduanya, Next.js memberikan developer experience yang lebih baik dengan:\n✅ File-based routing\n✅ API routes built-in\n✅ Optimized bundling\n✅ Great TypeScript support\n\nApa pendapat kalian? #react #nextjs',
       '#react #nextjs',
       'none',
       DATE_SUB(NOW(), INTERVAL 6 HOUR),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE user_id = @u_charlie 
    AND content LIKE '%React vs Next.js%'
);

-- Ambil ID post ke variabel
SELECT id INTO @p_alice_1 FROM posts WHERE user_id = @u_alice AND content LIKE '%Selamat datang di ARNVERSE%' LIMIT 1;
SELECT id INTO @p_alice_2 FROM posts WHERE user_id = @u_alice AND content LIKE '%workspace saya hari ini%' LIMIT 1;
SELECT id INTO @p_bob_1 FROM posts WHERE user_id = @u_bob AND content LIKE '%Tips untuk developer pemula%' LIMIT 1;
SELECT id INTO @p_charlie_1 FROM posts WHERE user_id = @u_charlie AND content LIKE '%React vs Next.js%' LIMIT 1;

-- ===================================================================
-- 5. POST-HASHTAG RELATIONSHIPS
-- ===================================================================
INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_alice_1, @h_arnverse
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_alice_1 AND hashtag_id = @h_arnverse);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_alice_1, @h_teknologi
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_alice_1 AND hashtag_id = @h_teknologi);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_alice_2, @h_coding
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_alice_2 AND hashtag_id = @h_coding);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_alice_2, @h_dev
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_alice_2 AND hashtag_id = @h_dev);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_bob_1, @h_programming
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_bob_1 AND hashtag_id = @h_programming);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_bob_1, @h_indonesia
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_bob_1 AND hashtag_id = @h_indonesia);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_charlie_1, @h_react
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_charlie_1 AND hashtag_id = @h_react);

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT @p_charlie_1, @h_nextjs
WHERE NOT EXISTS (SELECT 1 FROM post_hashtags WHERE post_id = @p_charlie_1 AND hashtag_id = @h_nextjs);

-- ===================================================================
-- 6. FOLLOW RELATIONSHIPS
-- ===================================================================
INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_alice, @u_bob, DATE_SUB(NOW(), INTERVAL 5 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_alice AND following_id = @u_bob);

INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_alice, @u_charlie, DATE_SUB(NOW(), INTERVAL 3 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_alice AND following_id = @u_charlie);

INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_bob, @u_alice, DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_bob AND following_id = @u_alice);

INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_bob, @u_charlie, DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_bob AND following_id = @u_charlie);

INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_charlie, @u_alice, DATE_SUB(NOW(), INTERVAL 6 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_charlie AND following_id = @u_alice);

INSERT INTO follows (follower_id, following_id, created_at)
SELECT @u_charlie, @u_bob, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM follows WHERE follower_id = @u_charlie AND following_id = @u_bob);

-- ===================================================================
-- 7. COMMENTS DEMO
-- ===================================================================
INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_alice_1, @u_bob, 'Keren banget Alice! Sudah ditunggu-tunggu platform seperti ini 🔥', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_alice_1 AND user_id = @u_bob 
    AND content LIKE '%Keren banget Alice%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_alice_1, @u_charlie, 'UI-nya clean banget, good job team! 👏', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_alice_1 AND user_id = @u_charlie 
    AND content LIKE '%UI-nya clean banget%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_alice_1, @u_alice, 'Terima kasih supportnya guys! Masih banyak fitur keren yang akan datang ✨', DATE_SUB(NOW(), INTERVAL 20 HOUR), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_alice_1 AND user_id = @u_alice 
    AND content LIKE '%Terima kasih supportnya%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_bob_1, @u_alice, 'Tips nomor 4 paling penting! Build real projects memang beda feelnya', DATE_SUB(NOW(), INTERVAL 12 HOUR), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_bob_1 AND user_id = @u_alice 
    AND content LIKE '%Tips nomor 4 paling penting%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_bob_1, @u_charlie, 'Setuju! Dan jangan lupa dokumentasi yang baik juga penting 📝', DATE_SUB(NOW(), INTERVAL 10 HOUR), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_bob_1 AND user_id = @u_charlie 
    AND content LIKE '%dokumentasi yang baik%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_charlie_1, @u_alice, 'Next.js memang powerfull! Tapi untuk simple app, React vanilla juga cukup sih', DATE_SUB(NOW(), INTERVAL 4 HOUR), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_charlie_1 AND user_id = @u_alice 
    AND content LIKE '%Next.js memang powerfull%'
);

INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
SELECT @p_charlie_1, @u_bob, 'TypeScript support di Next.js emang top! 👌', DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comments 
    WHERE post_id = @p_charlie_1 AND user_id = @u_bob 
    AND content LIKE '%TypeScript support%'
);

-- ===================================================================
-- 8. LIKES DEMO
-- ===================================================================
-- Likes untuk posts
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_bob, 'post', @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_bob AND likeable_type = 'post' AND likeable_id = @p_alice_1);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_charlie, 'post', @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_charlie AND likeable_type = 'post' AND likeable_id = @p_alice_1);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_alice, 'post', @p_bob_1, DATE_SUB(NOW(), INTERVAL 12 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_alice AND likeable_type = 'post' AND likeable_id = @p_bob_1);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_charlie, 'post', @p_bob_1, DATE_SUB(NOW(), INTERVAL 10 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_charlie AND likeable_type = 'post' AND likeable_id = @p_bob_1);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_alice, 'post', @p_charlie_1, DATE_SUB(NOW(), INTERVAL 4 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_alice AND likeable_type = 'post' AND likeable_id = @p_charlie_1);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_bob, 'post', @p_charlie_1, DATE_SUB(NOW(), INTERVAL 3 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_bob AND likeable_type = 'post' AND likeable_id = @p_charlie_1);

-- ===================================================================
-- 9. STORIES DEMO (BELUM EXPIRED)
-- ===================================================================
INSERT INTO stories (user_id, media_url, media_type, content, duration, expired_at, created_at)
SELECT @u_alice,
       '/uploads/demo/story_alice_1.jpg',
       'image',
       'Working on new features! 💻✨',
       5,
       DATE_ADD(NOW(), INTERVAL 20 HOUR),
       DATE_SUB(NOW(), INTERVAL 4 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE user_id = @u_alice 
    AND content LIKE '%Working on new features%'
);

INSERT INTO stories (user_id, media_url, media_type, content, duration, expired_at, created_at)
SELECT @u_bob,
       '/uploads/demo/story_bob_1.jpg', 
       'image',
       'Coffee time ☕ Ready to code!',
       5,
       DATE_ADD(NOW(), INTERVAL 18 HOUR),
       DATE_SUB(NOW(), INTERVAL 6 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE user_id = @u_bob 
    AND content LIKE '%Coffee time%'
);

INSERT INTO stories (user_id, media_url, media_type, content, duration, expired_at, created_at)
SELECT @u_charlie,
       '/uploads/demo/story_charlie_1.jpg',
       'image', 
       'New design mockup in progress 🎨',
       5,
       DATE_ADD(NOW(), INTERVAL 22 HOUR),
       DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE user_id = @u_charlie 
    AND content LIKE '%New design mockup%'
);

-- Story yang sudah expired (untuk testing)
INSERT INTO stories (user_id, media_url, media_type, content, duration, expired_at, created_at)
SELECT @u_alice,
       '/uploads/demo/story_alice_old.jpg',
       'image',
       'Yesterday coding session 💪',
       5,
       DATE_SUB(NOW(), INTERVAL 2 HOUR),
       DATE_SUB(NOW(), INTERVAL 26 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM stories 
    WHERE user_id = @u_alice 
    AND content LIKE '%Yesterday coding session%'
);

-- Ambil ID story ke variabel
SELECT id INTO @s_alice FROM stories WHERE user_id = @u_alice AND content LIKE '%Working on new features%' LIMIT 1;
SELECT id INTO @s_bob FROM stories WHERE user_id = @u_bob AND content LIKE '%Coffee time%' LIMIT 1;
SELECT id INTO @s_charlie FROM stories WHERE user_id = @u_charlie AND content LIKE '%New design mockup%' LIMIT 1;

-- ===================================================================
-- 10. STORY VIEWS DAN LIKES
-- ===================================================================
-- Story views
INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_alice, @u_bob, DATE_SUB(NOW(), INTERVAL 3 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_alice AND user_id = @u_bob);

INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_alice, @u_charlie, DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_alice AND user_id = @u_charlie);

INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_bob, @u_alice, DATE_SUB(NOW(), INTERVAL 5 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_bob AND user_id = @u_alice);

INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_bob, @u_charlie, DATE_SUB(NOW(), INTERVAL 4 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_bob AND user_id = @u_charlie);

INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_charlie, @u_alice, DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_charlie AND user_id = @u_alice);

INSERT INTO story_views (story_id, user_id, created_at)
SELECT @s_charlie, @u_bob, DATE_SUB(NOW(), INTERVAL 30 MINUTE)
WHERE NOT EXISTS (SELECT 1 FROM story_views WHERE story_id = @s_charlie AND user_id = @u_bob);

-- Story likes
INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_bob, 'story', @s_alice, DATE_SUB(NOW(), INTERVAL 3 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_bob AND likeable_type = 'story' AND likeable_id = @s_alice);

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at)
SELECT @u_alice, 'story', @s_charlie, DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM likes WHERE user_id = @u_alice AND likeable_type = 'story' AND likeable_id = @s_charlie);

-- ===================================================================
-- 11. BOOKMARKS DEMO
-- ===================================================================
INSERT INTO bookmarks (user_id, post_id, created_at)
SELECT @u_alice, @p_bob_1, DATE_SUB(NOW(), INTERVAL 12 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM bookmarks WHERE user_id = @u_alice AND post_id = @p_bob_1);

INSERT INTO bookmarks (user_id, post_id, created_at)
SELECT @u_bob, @p_charlie_1, DATE_SUB(NOW(), INTERVAL 4 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM bookmarks WHERE user_id = @u_bob AND post_id = @p_charlie_1);

INSERT INTO bookmarks (user_id, post_id, created_at)
SELECT @u_charlie, @p_alice_1, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (SELECT 1 FROM bookmarks WHERE user_id = @u_charlie AND post_id = @p_alice_1);

-- ===================================================================
-- 12. CHAT DEMO (DM DAN GROUP)
-- ===================================================================
INSERT INTO chats (type, participants_count, created_at, updated_at)
SELECT 'dm', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()
WHERE NOT EXISTS (SELECT 1 FROM chats WHERE type = 'dm' LIMIT 1);

INSERT INTO chats (name, type, description, participants_count, created_by, created_at, updated_at)
SELECT 'General Group', 'group', 'Diskusi umum para developer ARNVERSE', 3, @u_alice, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()
WHERE NOT EXISTS (SELECT 1 FROM chats WHERE name = 'General Group');

-- Ambil chat ID
SELECT id INTO @chat_dm FROM chats WHERE type = 'dm' ORDER BY id LIMIT 1;
SELECT id INTO @chat_group FROM chats WHERE name = 'General Group' LIMIT 1;

-- Chat participants
INSERT INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at)
SELECT @chat_dm, @u_alice, 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = @chat_dm AND user_id = @u_alice);

INSERT INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at)
SELECT @chat_dm, @u_bob, 'member', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = @chat_dm AND user_id = @u_bob);

INSERT INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at)
SELECT @chat_group, @u_alice, 'admin', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 3 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = @chat_group AND user_id = @u_alice);

INSERT INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at)
SELECT @chat_group, @u_bob, 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 4 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = @chat_group AND user_id = @u_bob);

INSERT INTO chat_participants (chat_id, user_id, role, joined_at, last_read_at)
SELECT @chat_group, @u_charlie, 'member', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 5 HOUR)
WHERE NOT EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = @chat_group AND user_id = @u_charlie);

-- ===================================================================
-- 13. MESSAGES DEMO
-- ===================================================================
-- Messages untuk DM
INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_dm, @u_alice, 'Hey Bob! Gimana kabar project terbarunya?', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_dm AND user_id = @u_alice 
    AND content LIKE '%Gimana kabar project%'
);

INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_dm, @u_bob, 'Hi Alice! Alhamdulillah lancar, lagi fokus di backend API nih', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_dm AND user_id = @u_bob 
    AND content LIKE '%lagi fokus di backend%'
);

INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_dm, @u_alice, 'Keren! Kalau butuh bantuan testing atau feedback UI jangan sungkan ya 😊', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_dm AND user_id = @u_alice 
    AND content LIKE '%butuh bantuan testing%'
);

INSERT INTO messages (chat_id, user_id, content, media_url, media_type, created_at, updated_at)
SELECT @chat_dm, @u_bob, 'Siap! Nanti ku share progress-nya. BTW ini screenshot latest update', '/uploads/demo/progress_screenshot.png', 'image', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_dm AND user_id = @u_bob 
    AND content LIKE '%share progress-nya%'
);

-- Messages untuk Group
INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_group, @u_alice, 'Welcome to ARNVERSE developer group! 👋', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_group AND user_id = @u_alice 
    AND content LIKE '%Welcome to ARNVERSE%'
);

INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_group, @u_bob, 'Thanks Alice! Excited to collaborate 🚀', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_group AND user_id = @u_bob 
    AND content LIKE '%Excited to collaborate%'
);

INSERT INTO messages (chat_id, user_id, content, created_at, updated_at)
SELECT @chat_group, @u_charlie, 'Great! Siap support dari sisi design 🎨', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM messages 
    WHERE chat_id = @chat_group AND user_id = @u_charlie 
    AND content LIKE '%support dari sisi design%'
);

-- ===================================================================
-- 14. PUBLIC CHAT MESSAGES
-- ===================================================================
INSERT INTO public_chat_messages (user_id, content, created_at)
SELECT @u_alice, 'Halo semua! Welcome to ARNVERSE public chat 👋', DATE_SUB(NOW(), INTERVAL 3 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM public_chat_messages 
    WHERE user_id = @u_alice 
    AND content LIKE '%Welcome to ARNVERSE public chat%'
);

INSERT INTO public_chat_messages (user_id, content, created_at)
SELECT @u_bob, 'Hi Alice! Excited to be here 🚀', DATE_SUB(NOW(), INTERVAL 2 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM public_chat_messages 
    WHERE user_id = @u_bob 
    AND content LIKE '%Excited to be here%'
);

INSERT INTO public_chat_messages (user_id, content, created_at)
SELECT @u_charlie, 'The design looks amazing! Great work team ✨', DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM public_chat_messages 
    WHERE user_id = @u_charlie 
    AND content LIKE '%design looks amazing%'
);

INSERT INTO public_chat_messages (user_id, content, created_at)
SELECT @u_alice, 'Thanks everyone! Jangan lupa share feedback kalau ada suggestions 💡', DATE_SUB(NOW(), INTERVAL 30 MINUTE)
WHERE NOT EXISTS (
    SELECT 1 FROM public_chat_messages 
    WHERE user_id = @u_alice 
    AND content LIKE '%share feedback kalau ada suggestions%'
);

-- ===================================================================
-- 15. NOTIFICATIONS DEMO
-- ===================================================================
INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at)
SELECT @u_alice, @u_bob, 'like', 'post', @p_alice_1, 'Bob Developer menyukai post Anda', 'Post: "Selamat datang di ARNVERSE! 🎉"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE user_id = @u_alice AND actor_id = @u_bob AND type = 'like' AND entity_id = @p_alice_1
);

INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at)
SELECT @u_alice, @u_charlie, 'comment', 'post', @p_alice_1, 'Charlie Designer berkomentar di post Anda', 'Komentar: "UI-nya clean banget, good job team! 👏"', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE user_id = @u_alice AND actor_id = @u_charlie AND type = 'comment' AND entity_id = @p_alice_1
);

INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at)
SELECT @u_alice, @u_bob, 'follow', 'user', @u_alice, 'Bob Developer mulai mengikuti Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE user_id = @u_alice AND actor_id = @u_bob AND type = 'follow' AND entity_id = @u_alice
);

INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at)
SELECT @u_bob, @u_alice, 'like', 'post', @p_bob_1, 'Alice Cooper menyukai post Anda', 'Post: "Tips untuk developer pemula"', 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE user_id = @u_bob AND actor_id = @u_alice AND type = 'like' AND entity_id = @p_bob_1
);

INSERT INTO notifications (user_id, actor_id, type, entity_type, entity_id, title, message, is_read, created_at)
SELECT @u_charlie, @u_alice, 'story_view', 'story', @s_charlie, 'Alice Cooper melihat story Anda', NULL, 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications 
    WHERE user_id = @u_charlie AND actor_id = @u_alice AND type = 'story_view' AND entity_id = @s_charlie
);

-- ===================================================================
-- 16. RECOUNT AMAN AGREGAT (TANPA SUBQUERY TRIGGER-PRONE)
-- ===================================================================

-- Update likes_count di posts  
UPDATE posts p SET likes_count = (
    SELECT COUNT(*) FROM likes l WHERE l.likeable_type = 'post' AND l.likeable_id = p.id
);

-- Update comments_count di posts
UPDATE posts p SET comments_count = (
    SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
);

-- Update views_count di stories
UPDATE stories s SET views_count = (
    SELECT COUNT(*) FROM story_views sv WHERE sv.story_id = s.id
);

-- Update likes_count di stories
UPDATE stories s SET likes_count = (
    SELECT COUNT(*) FROM likes l WHERE l.likeable_type = 'story' AND l.likeable_id = s.id
);

-- Update posts_count di users
UPDATE users u SET posts_count = (
    SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id
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

-- Update participants_count di chats
UPDATE chats c SET participants_count = (
    SELECT COUNT(*) FROM chat_participants cp WHERE cp.chat_id = c.id
);

-- ===================================================================
-- 17. SELESAI - COMMIT DAN RESTORE FK
-- ===================================================================

COMMIT;
SET FOREIGN_KEY_CHECKS = @OLD_FK_CHECKS;

-- ===================================================================
-- SEED DATA SELESAI
-- 
-- File ini idempotent dan aman dijalankan berulang kali.
-- 
-- TESTING CEPAT:
-- 1. SELECT COUNT(*) FROM users;           -- Harus ada 3 user
-- 2. SELECT COUNT(*) FROM posts;           -- Harus ada 4 post
-- 3. SELECT COUNT(*) FROM follows;         -- Harus ada 6 follow
-- 4. SELECT COUNT(*) FROM likes;           -- Harus ada 8 like (6 post + 2 story)
-- 5. SELECT COUNT(*) FROM hashtags;        -- Harus ada 10 hashtag
-- 6. SELECT COUNT(*) FROM stories;         -- Harus ada 4 story (3 aktif + 1 expired)
-- 7. SELECT COUNT(*) FROM messages;        -- Harus ada 7 message
-- 8. SELECT COUNT(*) FROM notifications;   -- Harus ada 5 notification
-- 
-- LOGIN TEST:
-- Email: alice@arnverse.com
-- Password: password
-- ===================================================================

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