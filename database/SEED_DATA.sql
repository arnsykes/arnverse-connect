-- ARNVERSE Seed Data
-- Realistic demo data for development and testing

USE arnverse;

-- =================================================
-- SEED USERS
-- =================================================

-- Demo users with hashed passwords (password123 for all)
INSERT INTO users (username, email, password_hash, display_name, bio, is_exclusive, is_verified, is_admin) VALUES 
('alice_cosmic', 'alice@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Cooper', 'Digital artist exploring the cosmic realm. Creating magic with pixels and imagination. ✨🎨', 1, 1, 0),
('cosmic_dev', 'dev@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cosmic Developer', 'Building the future of social connection in the ARNVERSE. Code is poetry. 💫', 0, 1, 1),
('space_explorer', 'luna@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luna Explorer', 'Adventure seeker and photographer. Capturing moments that take your breath away. 🌄📸', 1, 1, 0),
('stellar_musician', 'stella@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Stella Sounds', 'Music producer creating otherworldly beats. Let the rhythm guide your soul. 🎵🎹', 0, 0, 0),
('tech_innovator', 'innovation@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Future Tech', 'Building tomorrow\'s technology today. AI, blockchain, and beyond. 🤖⚡', 1, 1, 0),
('cosmic_writer', 'writer@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cosmic Storyteller', 'Weaving tales from across the universe. Words are portals to other worlds. 📚✍️', 0, 0, 0),
('galactic_chef', 'chef@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Galactic Chef', 'Creating culinary experiences that are out of this world. Food is love. 👨‍🍳🍴', 0, 0, 0),
('nebula_dancer', 'dance@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nebula Grace', 'Movement artist expressing the beauty of the cosmos through dance. 💃✨', 1, 0, 0);

-- Insert user settings for all users
INSERT INTO user_settings (user_id, allow_comments, show_online_status, email_notifications, push_notifications) 
SELECT id, 1, 1, 1, 1 FROM users;

-- =================================================
-- SEED FOLLOWS
-- =================================================

INSERT INTO follows (follower_id, following_id, status) VALUES 
(1, 2, 'accepted'), (1, 3, 'accepted'), (1, 5, 'accepted'),
(2, 1, 'accepted'), (2, 3, 'accepted'), (2, 4, 'accepted'), (2, 5, 'accepted'),
(3, 1, 'accepted'), (3, 2, 'accepted'), (3, 4, 'accepted'),
(4, 1, 'accepted'), (4, 2, 'accepted'), (4, 3, 'accepted'), (4, 6, 'accepted'),
(5, 1, 'accepted'), (5, 2, 'accepted'), (5, 8, 'accepted'),
(6, 1, 'accepted'), (6, 4, 'accepted'), (6, 7, 'accepted'),
(7, 2, 'accepted'), (7, 6, 'accepted'), (7, 8, 'accepted'),
(8, 1, 'accepted'), (8, 3, 'accepted'), (8, 5, 'accepted'), (8, 7, 'accepted');

-- =================================================
-- SEED POSTS
-- =================================================

INSERT INTO posts (user_id, content, media_urls, hashtags, likes_count, comments_count, views_count, created_at) VALUES 
(1, 'Just dropped a new cosmic track! 🎵✨ The universe is full of melodies waiting to be discovered. What\'s your favorite song that makes you feel like you\'re floating among the stars?', 
'["/uploads/posts/cosmic-track-cover.jpg"]', 
'["CosmicVibes", "Music", "DigitalArt"]', 
234, 18, 1247, 
DATE_SUB(NOW(), INTERVAL 2 HOUR)),

(2, 'Building something magical in the ARNVERSE today! 💫 The future of social connection is here, and it\'s more beautiful than we ever imagined. Can\'t wait to share what we\'ve been working on!', 
NULL, 
'["ARNVERSE", "TechInnovation", "Community"]', 
187, 25, 892, 
DATE_SUB(NOW(), INTERVAL 4 HOUR)),

(3, 'Captured this stunning view from my morning hike. Sometimes you need to step away from the screens and connect with the real universe around us. Nature is the ultimate inspiration! 🌄', 
'["/uploads/posts/mountain-sunrise.jpg", "/uploads/posts/mountain-panorama.jpg"]', 
'["Photography", "Nature", "Inspiration"]', 
456, 32, 2134, 
DATE_SUB(NOW(), INTERVAL 6 HOUR)),

(4, 'Working on a new ambient piece that captures the sound of distant galaxies. Music is the universal language that connects all beings across space and time. 🎹🌌', 
'["/uploads/posts/studio-setup.jpg"]', 
'["Music", "CosmicVibes", "Studio"]', 
198, 15, 743, 
DATE_SUB(NOW(), INTERVAL 8 HOUR)),

(5, 'The intersection of AI and creativity is where magic happens. Just trained a model that can generate art in the style of nebulae. The results are absolutely mind-blowing! 🤖🎨', 
'["/uploads/posts/ai-art-demo.jpg"]', 
'["TechInnovation", "AI", "DigitalArt"]', 
324, 41, 1567, 
DATE_SUB(NOW(), INTERVAL 12 HOUR)),

(6, 'Started writing a short story about a civilization that lives inside a black hole. The physics might be impossible, but the story possibilities are infinite! 📚✨', 
NULL, 
'["Writing", "SciFi", "Creativity"]', 
143, 28, 567, 
DATE_SUB(NOW(), INTERVAL 1 DAY)),

(7, 'Experimented with molecular gastronomy today! Created edible \"stars\" that literally sparkle on your tongue. Food is the ultimate art form. 👨‍🍳⭐', 
'["/uploads/posts/molecular-stars.jpg"]', 
'["Food", "Art", "Innovation"]', 
289, 37, 1023, 
DATE_SUB(NOW(), INTERVAL 1 DAY)),

(8, 'Choreographed a new piece inspired by the movement of galaxies. Dance is how I express the cosmic forces that move through all of us. 💃🌌', 
'["/uploads/posts/dance-rehearsal.jpg"]', 
'["Dance", "CosmicVibes", "Art"]', 
267, 22, 934, 
DATE_SUB(NOW(), INTERVAL 2 DAY));

-- =================================================
-- SEED COMMENTS
-- =================================================

INSERT INTO comments (post_id, user_id, content, likes_count, created_at) VALUES 
(1, 2, 'This track is absolutely incredible! The way you blend electronic and orchestral elements is pure genius. 🎵', 12, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(1, 3, 'Alice, your music always transports me to another dimension. Can\'t wait for the full album! ✨', 8, DATE_SUB(NOW(), INTERVAL 85 MINUTE)),
(1, 4, 'As a fellow musician, I have to say this is next-level stuff. The production quality is amazing!', 15, DATE_SUB(NOW(), INTERVAL 80 MINUTE)),

(2, 1, 'You guys are revolutionizing social media! Can\'t wait to see what features you roll out next. 💫', 23, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 5, 'The technical architecture behind ARNVERSE is fascinating. Would love to contribute to the project!', 18, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

(3, 1, 'Luna, your photography never fails to amaze me. This shot is wallpaper-worthy! 📸', 19, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(3, 2, 'The composition and lighting in this shot is perfect. Nature is indeed the best artist.', 14, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 4, 'Makes me want to go hiking immediately! Where was this taken?', 7, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

(5, 1, 'The future is here! This AI art is indistinguishable from human creativity. Mind blown! 🤯', 27, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
(5, 3, 'The details in these AI-generated nebulae are incredible. Technology meets art in the most beautiful way.', 21, DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- =================================================
-- SEED STORIES
-- =================================================

INSERT INTO stories (user_id, media_url, media_type, duration, views_count, likes_count, expires_at, created_at) VALUES 
(1, '/uploads/stories/alice-studio.jpg', 'image', 5000, 125, 45, DATE_ADD(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, '/uploads/stories/alice-concert-prep.jpg', 'image', 5000, 98, 32, DATE_ADD(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),

(2, '/uploads/stories/dev-coding.jpg', 'image', 5000, 234, 67, DATE_ADD(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

(3, '/uploads/stories/luna-mountain.jpg', 'image', 5000, 189, 56, DATE_ADD(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(3, '/uploads/stories/luna-sunrise-timelapse.mp4', 'video', 15000, 267, 89, DATE_ADD(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),

(4, '/uploads/stories/stella-new-track.jpg', 'image', 5000, 156, 43, DATE_ADD(NOW(), INTERVAL 16 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),

(5, '/uploads/stories/tech-ai-demo.jpg', 'image', 5000, 298, 78, DATE_ADD(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR));

-- =================================================
-- SEED STORY VIEWS
-- =================================================

INSERT INTO story_views (story_id, user_id, viewed_at) VALUES 
(1, 2, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (1, 3, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (1, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (2, 4, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)), (3, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR)), (3, 5, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 1, DATE_SUB(NOW(), INTERVAL 5 HOUR)), (4, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 2, DATE_SUB(NOW(), INTERVAL 4 HOUR)), (5, 4, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- =================================================
-- SEED LIKES
-- =================================================

INSERT INTO likes (user_id, likeable_type, likeable_id, created_at) VALUES 
-- Post likes
(2, 'post', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)), (3, 'post', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)), (4, 'post', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'post', 2, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (3, 'post', 2, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (5, 'post', 2, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'post', 3, DATE_SUB(NOW(), INTERVAL 4 HOUR)), (2, 'post', 3, DATE_SUB(NOW(), INTERVAL 4 HOUR)), (4, 'post', 3, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, 'post', 5, DATE_SUB(NOW(), INTERVAL 8 HOUR)), (2, 'post', 5, DATE_SUB(NOW(), INTERVAL 7 HOUR)), (3, 'post', 5, DATE_SUB(NOW(), INTERVAL 6 HOUR)),

-- Comment likes
(1, 'comment', 1, DATE_SUB(NOW(), INTERVAL 80 MINUTE)), (3, 'comment', 1, DATE_SUB(NOW(), INTERVAL 75 MINUTE)),
(2, 'comment', 4, DATE_SUB(NOW(), INTERVAL 2 HOUR)), (5, 'comment', 4, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Story likes
(2, 'story', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)), (3, 'story', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'story', 3, DATE_SUB(NOW(), INTERVAL 1 HOUR)), (4, 'story', 3, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- =================================================
-- SEED BOOKMARKS
-- =================================================

INSERT INTO bookmarks (user_id, post_id, created_at) VALUES 
(2, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 3, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 2, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 5, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(1, 7, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- =================================================
-- SEED CHATS AND MESSAGES
-- =================================================

-- DM chats
INSERT INTO chats (type, created_by, last_message_at, created_at) VALUES 
('dm', 1, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('dm', 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('group', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 WEEK));

-- Update group chat with name
UPDATE chats SET name = 'Cosmic Creators', description = 'A group for artists, musicians, and creators in the ARNVERSE' WHERE id = 3;

-- Chat participants
INSERT INTO chat_participants (chat_id, user_id, role, last_read_at) VALUES 
(1, 1, 'member', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(1, 2, 'member', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(2, 2, 'member', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 3, 'member', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 1, 'owner', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 2, 'admin', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 4, 'member', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 6, 'member', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Messages
INSERT INTO messages (chat_id, user_id, content, created_at) VALUES 
(1, 1, 'Hey! Just wanted to say your latest track is absolutely amazing! 🎵', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 2, 'Thank you so much! That means a lot coming from you. Working on something even bigger next! ✨', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 1, 'Can\'t wait to hear it! Let me know if you need any artistic input.', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

(2, 2, 'The new ARNVERSE features are looking incredible! 💫', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 3, 'Right? The team has been working non-stop. The story viewer is my favorite addition.', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 2, 'The UI/UX is so smooth and intuitive. Great job!', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

(3, 1, 'Welcome to the Cosmic Creators group! 🌟', DATE_SUB(NOW(), INTERVAL 1 WEEK)),
(3, 2, 'Excited to be here! Looking forward to collaborating with everyone.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 4, 'This is going to be amazing for sharing our creative processes!', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 6, 'Perfect timing! I just finished a new story that would be great to share here.', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- =================================================
-- SEED NOTIFICATIONS
-- =================================================

INSERT INTO notifications (user_id, type, actor_id, notifiable_type, notifiable_id, data, created_at) VALUES 
(1, 'like', 2, 'post', 1, '{"post_title": "Just dropped a new cosmic track!"}', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'comment', 3, 'post', 1, '{"comment_preview": "Alice, your music always transports me..."}', DATE_SUB(NOW(), INTERVAL 85 MINUTE)),
(1, 'follow', 4, 'user', 4, '{"follower_username": "stellar_musician"}', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'story_view', 5, 'story', 1, '{"viewer_username": "tech_innovator"}', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

(2, 'like', 1, 'post', 2, '{"post_title": "Building something magical in the ARNVERSE today!"}', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'comment', 5, 'post', 2, '{"comment_preview": "The technical architecture behind ARNVERSE..."}', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'message', 1, 'message', 3, '{"chat_type": "dm", "message_preview": "Can\'t wait to hear it!"}', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),

(3, 'like', 1, 'post', 3, '{"post_title": "Captured this stunning view from my morning hike"}', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 'like', 2, 'post', 3, '{"post_title": "Captured this stunning view from my morning hike"}', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 'story_view', 2, 'story', 4, '{"viewer_username": "cosmic_dev"}', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- =================================================
-- SEED PUBLIC CHAT MESSAGES
-- =================================================

INSERT INTO public_chat_messages (user_id, content, created_at) VALUES 
(1, 'Welcome everyone to the ARNVERSE public chatroom! 🌟', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 'This is such a cool feature! Love how the community can connect here.', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'Just shared some amazing shots from my morning hike. Nature is incredible! 📸', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(4, 'Working on some new ambient tracks. The creative energy here is inspiring! 🎵', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(5, 'The intersection of technology and creativity in this platform is fascinating.', DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
(6, 'Starting to write a new sci-fi story inspired by this community! ✍️', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(7, 'Food and art have so much in common. Both nourish the soul! 👨‍🍳', DATE_SUB(NOW(), INTERVAL 5 MINUTE));

-- =================================================
-- UPDATE HASHTAG USAGE
-- =================================================

-- Update hashtags based on post usage
UPDATE hashtags SET posts_count = 2, last_used_at = NOW() WHERE name = 'CosmicVibes';
UPDATE hashtags SET posts_count = 2, last_used_at = NOW() WHERE name = 'Music';
UPDATE hashtags SET posts_count = 2, last_used_at = NOW() WHERE name = 'DigitalArt';
UPDATE hashtags SET posts_count = 2, last_used_at = NOW() WHERE name = 'TechInnovation';
UPDATE hashtags SET posts_count = 1, last_used_at = NOW() WHERE name = 'ARNVERSE';
UPDATE hashtags SET posts_count = 1, last_used_at = NOW() WHERE name = 'Photography';

-- Add post-hashtag relationships
INSERT INTO post_hashtags (post_id, hashtag_id) VALUES 
(1, 1), (1, 7), (1, 3), -- CosmicVibes, Music, DigitalArt
(2, 2), (2, 4), (2, 10), -- ARNVERSE, TechInnovation, Community
(3, 6), (3, 9), -- Photography, Inspiration  
(4, 7), (4, 1), -- Music, CosmicVibes
(5, 4), (5, 3), -- TechInnovation, DigitalArt
(8, 1); -- CosmicVibes

-- Update trending scores
CALL UpdateTrendingScores();