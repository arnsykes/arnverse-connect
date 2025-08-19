<?php
/**
 * Mark Story as Viewed Endpoint
 * POST /api/story_view.php
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
    
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $storyId = (int)($input['story_id'] ?? 0);
    
    if (!$storyId) {
        sendValidationError('Story ID wajib diisi');
        exit;
    }
    
    $db = getDB();
    
    // Cek apakah story ada dan masih aktif
    $story = $db->fetch(
        "SELECT id, user_id FROM stories WHERE id = ? AND expired_at > NOW() AND is_active = 1", 
        [$storyId]
    );
    
    if (!$story) {
        sendNotFound('Story tidak ditemukan atau sudah expired');
        exit;
    }
    
    // Jangan tambah view untuk story sendiri
    if ($story['user_id'] == $userId) {
        sendSuccess(['message' => 'Story sendiri tidak perlu view']);
        exit;
    }
    
    $db->beginTransaction();
    
    // Cek apakah user sudah pernah view story ini
    $existingView = $db->fetch(
        "SELECT id FROM story_views WHERE user_id = ? AND story_id = ?",
        [$userId, $storyId]
    );
    
    if (!$existingView) {
        // Insert view record
        $db->execute(
            "INSERT INTO story_views (user_id, story_id, viewed_at) VALUES (?, ?, NOW())",
            [$userId, $storyId]
        );
        
        // Create notification untuk pemilik story
        $db->execute(
            "INSERT INTO notifications (user_id, type, actor_id, story_id, created_at) 
             VALUES (?, 'story_view', ?, ?, NOW())",
            [$story['user_id'], $userId, $storyId]
        );
    }
    
    $db->commit();
    
    // Get updated view count
    $viewCount = $db->fetch(
        "SELECT COUNT(*) as count FROM story_views WHERE story_id = ?", 
        [$storyId]
    )['count'];
    
    $response = [
        'story_id' => $storyId,
        'is_viewed' => true,
        'views_count' => (int)$viewCount
    ];
    
    sendSuccess($response);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}