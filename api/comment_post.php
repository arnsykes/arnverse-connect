<?php
/**
 * Comment on Post Endpoint
 * POST /api/comment_post.php
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
    if (!checkRateLimit($userId, 'comment', 10, 300)) {
        sendError('Terlalu banyak komentar dalam 5 menit terakhir', 429);
        exit;
    }
    
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $postId = (int)($input['post_id'] ?? 0);
    $content = sanitizeString($input['content'] ?? '', 500);
    $parentId = (int)($input['parent_id'] ?? 0) ?: null; // Reply ke comment lain
    
    // Validasi input
    if (!$postId) {
        sendValidationError('Post ID wajib diisi');
        exit;
    }
    
    if (!$content || !validateLength($content, 1, 500)) {
        sendValidationError('Content komentar wajib diisi (max 500 karakter)');
        exit;
    }
    
    $db = getDB();
    
    // Cek apakah post ada
    $sql = "SELECT id, user_id FROM posts WHERE id = ?";
    if ($db->columnExists('posts', 'is_active')) {
        $sql .= " AND is_active = 1";
    }
    
    $post = $db->fetch($sql, [$postId]);
    if (!$post) {
        sendNotFound('Post tidak ditemukan');
        exit;
    }
    
    // Jika reply, cek parent comment
    if ($parentId) {
        $parentComment = $db->fetch("SELECT id, user_id FROM comments WHERE id = ? AND post_id = ?", [$parentId, $postId]);
        if (!$parentComment) {
            sendValidationError('Parent comment tidak ditemukan');
            exit;
        }
    }
    
    $db->beginTransaction();
    
    // Extract mentions dari komentar
    $mentions = extractMentions($content);
    $mentionsJson = !empty($mentions) ? json_encode($mentions) : null;
    
    // Insert comment
    $sql = "INSERT INTO comments (post_id, user_id, parent_id, content, mentions, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
    
    $db->execute($sql, [$postId, $userId, $parentId, $content, $mentionsJson]);
    $commentId = $db->lastInsertId();
    
    // Create notification untuk pemilik post (kecuali diri sendiri)
    if ($post['user_id'] != $userId && $db->tableExists('notifications')) {
        $db->execute(
            "INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, created_at) 
             VALUES (?, 'comment', ?, ?, ?, NOW())",
            [$post['user_id'], $userId, $postId, $commentId]
        );
    }
    
    // Jika reply, buat notif untuk parent comment owner juga
    if ($parentId && isset($parentComment) && $parentComment['user_id'] != $userId && 
        $parentComment['user_id'] != $post['user_id'] && $db->tableExists('notifications')) {
        $db->execute(
            "INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, created_at) 
             VALUES (?, 'reply', ?, ?, ?, NOW())",
            [$parentComment['user_id'], $userId, $postId, $commentId]
        );
    }
    
    // Create notifications untuk mentions
    if ($db->tableExists('notifications')) {
        foreach ($mentions as $mentionedUsername) {
            $mentionedUser = $db->fetch("SELECT id FROM users WHERE username = ?", [$mentionedUsername]);
            if ($mentionedUser && $mentionedUser['id'] != $userId) {
                $db->execute(
                    "INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id, created_at) 
                     VALUES (?, 'mention', ?, ?, ?, NOW())",
                    [$mentionedUser['id'], $userId, $postId, $commentId]
                );
            }
        }
    }
    
    $db->commit();
    
    // Ambil comment yang baru dibuat untuk response
    $newComment = $db->fetch("
        SELECT c.*, 
               u.id as author_id, u.username as author_username,
               u.display_name as author_display_name, u.avatar as author_avatar,
               u.is_verified as author_is_verified
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    ", [$commentId]);
    
    // Format comment data
    $formattedComment = [
        'id' => (int)$newComment['id'],
        'post_id' => (int)$newComment['post_id'],
        'parent_id' => $newComment['parent_id'] ? (int)$newComment['parent_id'] : null,
        'content' => $newComment['content'],
        'mentions' => $newComment['mentions'] ? json_decode($newComment['mentions'], true) : [],
        'likes_count' => (int)$newComment['likes_count'],
        'replies_count' => 0, // Baru dibuat, pasti 0
        'is_liked' => false,
        'created_at' => $newComment['created_at'],
        'updated_at' => $newComment['updated_at'],
        'author' => [
            'id' => (int)$newComment['author_id'],
            'username' => $newComment['author_username'],
            'display_name' => $newComment['author_display_name'],
            'avatar' => $newComment['author_avatar'] ? UPLOADS_URL . '/avatars/' . $newComment['author_avatar'] : null,
            'is_verified' => (bool)$newComment['author_is_verified']
        ]
    ];
    
    http_response_code(201);
    sendSuccess($formattedComment);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}