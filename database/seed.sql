-- ===================================================================
-- ARNVERSE Seed Data
-- Data contoh untuk testing dan development
-- ===================================================================

-- Insert demo users
INSERT INTO `users` (`username`, `email`, `password_hash`, `display_name`, `bio`, `avatar`, `is_verified`, `is_admin`, `is_active`) VALUES
('alice_cooper', 'alice@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Cooper', 'Frontend Developer & UI/UX Designer 🎨', null, 1, 0, 1),
('bob_tech', 'bob@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Tech', 'Full Stack Developer | Coffee addict ☕', null, 1, 0, 1),
('charlie_ui', 'charlie@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie Designer', 'Graphic Designer & Creative Director', null, 1, 1, 1),
('diana_dev', 'diana@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana Developer', 'React Native & Flutter Developer 📱', null, 0, 0, 1),
('erik_admin', 'erik@arnverse.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Erik Admin', 'System Administrator & DevOps Engineer', null, 1, 1, 1);

-- Insert sample posts
INSERT INTO `posts` (`user_id`, `content`, `media_urls`, `hashtags`, `likes_count`, `comments_count`, `shares_count`, `views_count`) VALUES
(1, 'Just finished redesigning the login page! What do you think? 🎨✨', '[]', '["#design", "#ui", "#ux"]', 5, 3, 1, 23),
(2, 'Working on a new React component library. Open source coming soon! 💻', '[]', '["#react", "#javascript", "#opensource"]', 8, 2, 2, 45),
(3, 'Beautiful sunset from my office window today 🌅', '[]', '["#sunset", "#photography", "#office"]', 12, 5, 0, 67),
(1, 'Quick tip: Always use semantic HTML elements for better accessibility! 🌐', '[]', '["#accessibility", "#html", "#webdev"]', 3, 1, 3, 34),
(4, 'Flutter vs React Native - which one do you prefer and why? 🤔', '[]', '["#flutter", "#reactnative", "#mobile"]', 15, 8, 1, 89),
(2, 'Coffee break with some clean code refactoring ☕👨‍💻', '[]', '["#coffee", "#coding", "#refactoring"]', 6, 2, 0, 28),
(3, 'New branding project completed! Brand identity is everything 🎯', '[]', '["#branding", "#identity", "#design"]', 9, 4, 2, 56),
(5, 'Server maintenance completed successfully! All systems running smooth 🚀', '[]', '["#devops", "#server", "#maintenance"]', 4, 1, 0, 19);

-- Insert sample comments
INSERT INTO `comments` (`post_id`, `user_id`, `content`, `likes`) VALUES
(1, 2, 'Love the new color scheme! Very clean and modern.', 2),
(1, 3, 'The typography choices are spot on 👌', 1),
(1, 4, 'Can you share the design process?', 0),
(2, 1, 'Looking forward to using this in my projects!', 3),
(2, 5, 'Make sure to add proper TypeScript definitions', 1),
(3, 1, 'Stunning view! Where is this?', 0),
(3, 2, 'Work from home goals right there 😊', 2),
(3, 4, 'This makes me want to redecorate my workspace', 1),
(3, 5, 'Perfect lighting for productivity', 0),
(5, 2, 'I prefer React Native for cross-platform consistency', 4),
(5, 3, 'Flutter has better performance in my experience', 3),
(5, 1, 'Both have their strengths, depends on the project', 2);

-- Insert sample likes
INSERT INTO `likes` (`user_id`, `post_id`, `likeable_type`, `likeable_id`) VALUES
(2, 1, 'post', 1),
(3, 1, 'post', 1),
(4, 1, 'post', 1),
(5, 1, 'post', 1),
(1, 2, 'post', 2),
(3, 2, 'post', 2),
(4, 2, 'post', 2),
(5, 2, 'post', 2),
(1, 3, 'post', 3),
(2, 3, 'post', 3),
(4, 3, 'post', 3),
(5, 3, 'post', 3),
(2, 4, 'post', 4),
(3, 4, 'post', 4),
(1, 5, 'post', 5),
(2, 5, 'post', 5),
(3, 5, 'post', 5);

-- Insert sample bookmarks
INSERT INTO `bookmarks` (`user_id`, `post_id`) VALUES
(1, 2),
(1, 5),
(2, 1),
(2, 3),
(3, 2),
(4, 1),
(4, 3),
(5, 2);

-- Insert sample hashtags
INSERT INTO `hashtags` (`name`, `posts_count`) VALUES
('#design', 3),
('#ui', 1), 
('#ux', 1),
('#react', 2),
('#javascript', 1),
('#opensource', 1),
('#sunset', 1),
('#photography', 1),
('#office', 1),
('#accessibility', 1),
('#html', 1),
('#webdev', 1),
('#flutter', 2),
('#reactnative', 2),
('#mobile', 1),
('#coffee', 1),
('#coding', 1),
('#refactoring', 1),
('#branding', 1),
('#identity', 1),
('#devops', 1),
('#server', 1),
('#maintenance', 1);

-- Insert post-hashtag relationships
INSERT INTO `post_hashtags` (`post_id`, `hashtag_id`) VALUES
(1, 1), (1, 2), (1, 3),  -- design, ui, ux
(2, 4), (2, 5), (2, 6),  -- react, javascript, opensource
(3, 7), (3, 8), (3, 9),  -- sunset, photography, office
(4, 10), (4, 11), (4, 12), -- accessibility, html, webdev
(5, 13), (5, 14), (5, 15), -- flutter, reactnative, mobile
(6, 16), (6, 17), (6, 18), -- coffee, coding, refactoring
(7, 19), (7, 20), (7, 1),  -- branding, identity, design
(8, 21), (8, 22), (8, 23); -- devops, server, maintenance

-- Insert sample stories (akan expire dalam 24 jam)
INSERT INTO `stories` (`user_id`, `media_url`, `media_type`, `content`, `duration`, `views_count`) VALUES
(1, 'story_1.jpg', 'image', 'Working late tonight! 🌙', 15, 5),
(2, 'story_2.jpg', 'image', 'New coffee shop discovery ☕', 15, 8),
(3, 'story_3.jpg', 'image', 'Sketch session for new project', 15, 12),
(4, 'story_4.jpg', 'image', 'Flutter app demo 📱', 15, 6),
(5, 'story_5.jpg', 'image', 'Server room tour 🖥️', 15, 3);

-- Insert sample story views
INSERT INTO `story_views` (`story_id`, `user_id`) VALUES
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 3), (2, 4), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 5),
(5, 1), (5, 2), (5, 3), (5, 4);

-- Insert sample follows
INSERT INTO `follows` (`follower_id`, `following_id`) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3), (5, 4);

-- Insert sample notifications
INSERT INTO `notifications` (`user_id`, `type`, `from_user_id`, `post_id`, `message`, `is_read`) VALUES
(1, 'like', 2, 1, 'Bob Tech liked your post', 0),
(1, 'comment', 3, 1, 'Charlie Designer commented on your post', 0),
(2, 'like', 1, 2, 'Alice Cooper liked your post', 1),
(3, 'follow', 1, null, 'Alice Cooper started following you', 0),
(4, 'comment', 2, 5, 'Bob Tech commented on your post', 0),
(5, 'like', 3, 8, 'Charlie Designer liked your post', 1);

-- Update user counts (followers, following, posts)
-- Note: This would normally be done with triggers, but for simplicity we'll do it manually here

COMMIT;