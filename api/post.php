<?php
/**
 * Create Post Endpoint
 * POST /api/post.php
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['POST']);

try {
    // Require authentication
    $user = require_auth();
    $userId = $user['id'];
    
    // Rate limiting
    if (!checkRateLimit($userId, 'create_post', 10, 3600)) {
        sendError('Terlalu banyak post dalam 1 jam terakhir', 429);
        exit;
    }
    
    // Ambil input
    $content = sanitizeString($_POST['content'] ?? '', 2000);
    
    // Validasi content
    if (!$content || !validateLength($content, 1, 2000)) {
        sendValidationError('Content post wajib diisi (max 2000 karakter)');
        exit;
    }
    
    $db = getDB();
    $db->beginTransaction();
    
    // Handle media upload
    $mediaUrls = [];
    if (isset($_FILES['media']) && is_array($_FILES['media']['name'])) {
        // Multiple files
        for ($i = 0; $i < count($_FILES['media']['name']); $i++) {
            if ($_FILES['media']['error'][$i] === UPLOAD_ERR_OK) {
                $file = [
                    'name' => $_FILES['media']['name'][$i],
                    'tmp_name' => $_FILES['media']['tmp_name'][$i],
                    'size' => $_FILES['media']['size'][$i],
                    'error' => $_FILES['media']['error'][$i]
                ];
                
                $upload = handleFileUpload($file, 'posts');
                $mediaUrls[] = $upload['url'];
            }
        }
    } else if (isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK) {
        // Single file
        $upload = handleFileUpload($_FILES['media'], 'posts');
        $mediaUrls[] = $upload['url'];
    }
    
    // Extract hashtags dan mentions
    $hashtags = extractHashtags($content);
    $mentions = extractMentions($content);
    
    // Insert post
    $sql = "INSERT INTO posts (user_id, content, media_urls, mentions, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())";
    
    $mediaUrlsJson = !empty($mediaUrls) ? json_encode($mediaUrls) : null;
    $mentionsJson = !empty($mentions) ? json_encode($mentions) : null;
    
    $db->execute($sql, [$userId, $content, $mediaUrlsJson, $mentionsJson]);
    $postId = $db->lastInsertId();
    
    // Process hashtags
    foreach ($hashtags as $hashtagName) {
        // Insert atau update hashtag
        $hashtagSql = "INSERT INTO hashtags (name, posts_count, last_used) 
                       VALUES (?, 1, NOW()) 
                       ON DUPLICATE KEY UPDATE 
                       posts_count = posts_count + 1, last_used = NOW()";
        $db->execute($hashtagSql, [$hashtagName]);
        
        // Get hashtag ID
        $hashtagId = $db->fetch("SELECT id FROM hashtags WHERE name = ?", [$hashtagName])['id'];
        
        // Link post ke hashtag
        $db->execute("INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)", [$postId, $hashtagId]);
    }
    
    // Create notifications untuk mentions
    foreach ($mentions as $mentionedUsername) {
        $mentionedUser = $db->fetch("SELECT id FROM users WHERE username = ?", [$mentionedUsername]);
        if ($mentionedUser) {
            $notifSql = "INSERT INTO notifications (user_id, type, actor_id, post_id, created_at) 
                         VALUES (?, 'mention', ?, ?, NOW())";
            $db->execute($notifSql, [$mentionedUser['id'], $userId, $postId]);
        }
    }
    
    $db->commit();
    
    // Ambil post yang baru dibuat untuk response
    $newPost = $db->fetch("
        SELECT p.*, 
               u.id as author_id, u.username as author_username, 
               u.display_name as author_display_name, u.avatar as author_avatar,
               u.is_verified as author_is_verified
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
    ", [$postId]);
    
    $newPost['hashtags'] = implode(',', $hashtags);
    $formattedPost = formatPostData($newPost, $userId);
    
    http_response_code(201);
    sendSuccess($formattedPost);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}