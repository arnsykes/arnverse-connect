<?php
/**
 * Like/Unlike Post Endpoint
 * POST /api/like_post.php
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
    if (!checkRateLimit($userId, 'like_action', 30, 60)) {
        sendError('Terlalu banyak aksi like dalam 1 menit terakhir', 429);
        exit;
    }
    
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $postId = (int)($input['post_id'] ?? 0);
    
    if (!$postId) {
        sendValidationError('Post ID wajib diisi');
        exit;
    }
    
    $db = getDB();
    
    // Cek apakah post ada
    $post = $db->fetch("SELECT id, user_id FROM posts WHERE id = ? AND is_active = 1", [$postId]);
    if (!$post) {
        sendNotFound('Post tidak ditemukan');
        exit;
    }
    
    $db->beginTransaction();
    
    // Cek apakah user sudah like post ini
    $existingLike = $db->fetch(
        "SELECT id FROM likes WHERE user_id = ? AND likeable_id = ? AND likeable_type = 'post'",
        [$userId, $postId]
    );
    
    $isLiked = false;
    
    if ($existingLike) {
        // Unlike - hapus like
        $db->execute(
            "DELETE FROM likes WHERE user_id = ? AND likeable_id = ? AND likeable_type = 'post'",
            [$userId, $postId]
        );
        $action = 'unliked';
    } else {
        // Like - tambah like
        $db->execute(
            "INSERT INTO likes (user_id, likeable_id, likeable_type, created_at) VALUES (?, ?, 'post', NOW())",
            [$userId, $postId]
        );
        $isLiked = true;
        $action = 'liked';
        
        // Create notification untuk pemilik post (kecuali diri sendiri)
        if ($post['user_id'] != $userId) {
            $db->execute(
                "INSERT INTO notifications (user_id, type, actor_id, post_id, created_at) 
                 VALUES (?, 'like', ?, ?, NOW())",
                [$post['user_id'], $userId, $postId]
            );
        }
    }
    
    $db->commit();
    
    // Get updated like count
    $likeCount = $db->fetch("SELECT COUNT(*) as count FROM likes WHERE likeable_id = ? AND likeable_type = 'post'", [$postId])['count'];
    
    $response = [
        'post_id' => $postId,
        'is_liked' => $isLiked,
        'likes_count' => (int)$likeCount,
        'action' => $action
    ];
    
    sendSuccess($response);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}