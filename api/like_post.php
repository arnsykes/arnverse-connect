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
    $sql = "SELECT id, user_id FROM posts WHERE id = ?";
    if ($db->columnExists('posts', 'is_active')) {
        $sql .= " AND is_active = 1";
    }
    
    $post = $db->fetch($sql, [$postId]);
    if (!$post) {
        sendNotFound('Post tidak ditemukan');
        exit;
    }
    
    $db->beginTransaction();
    
    // Cek apakah user sudah like post ini (using simple post_id column)
    $existingLike = $db->fetch(
        "SELECT id FROM likes WHERE user_id = ? AND post_id = ?",
        [$userId, $postId]
    );
    
    $isLiked = false;
    
    if ($existingLike) {
        // Unlike - hapus like
        $db->execute(
            "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
            [$userId, $postId]
        );
        $action = 'unliked';
    } else {
        // Like - tambah like
        $db->execute(
            "INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, NOW())",
            [$userId, $postId]
        );
        $isLiked = true;
        $action = 'liked';
        
        // Create notification untuk pemilik post (kecuali diri sendiri)
        if ($post['user_id'] != $userId && $db->tableExists('notifications')) {
            $db->execute(
                "INSERT INTO notifications (user_id, type, actor_id, post_id, created_at) 
                 VALUES (?, 'like', ?, ?, NOW())",
                [$post['user_id'], $userId, $postId]
            );
        }
    }
    
    $db->commit();
    
    // Get updated like count
    $likeCount = $db->fetch("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", [$postId])['count'];
    
    $response = [
        'post_id' => $postId,
        'is_liked' => $isLiked,
        'likes_count' => (int)$likeCount,
        'action' => $action
    ];
    
    sendSuccess($response);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}