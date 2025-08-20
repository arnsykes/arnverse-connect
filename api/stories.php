<?php
/**
 * Stories Endpoint
 * GET /api/stories.php - List active stories
 * POST /api/stories.php - Upload new story
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET', 'POST']);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // GET: List active stories
        
        // Optional authentication
        $currentUser = null;
        $token = Auth::getBearerToken();
        if ($token) {
            $payload = Auth::validateJWT($token);
            if ($payload && Auth::isSessionValid($token, $payload['uid'])) {
                $currentUser = Auth::getUserById($payload['uid']);
            }
        }
        
        $currentUserId = $currentUser ? $currentUser['id'] : null;
        
        $db = getDB();
        
        // Query stories (aktif dan belum expired)
        $sql = "
            SELECT 
                s.*,
                u.id as author_id,
                u.username as author_username,
                u.display_name as author_display_name,
                u.avatar as author_avatar,
                u.is_verified as author_is_verified,
                " . ($currentUserId ? "
                CASE WHEN sv.user_id IS NOT NULL THEN 1 ELSE 0 END as is_viewed
                " : "0 as is_viewed") . "
            FROM stories s
            JOIN users u ON s.user_id = u.id
            " . ($currentUserId ? "
            LEFT JOIN story_views sv ON s.id = sv.story_id AND sv.user_id = ?
            " : "") . "
            WHERE s.expired_at > NOW()
            ORDER BY 
                " . ($currentUserId ? "
                CASE WHEN s.user_id = ? THEN 0 ELSE 1 END,
                " : "") . "
                s.created_at DESC
        ";
        
        $params = [];
        if ($currentUserId) {
            $params[] = $currentUserId;
            $params[] = $currentUserId;
        }
        
        $stories = $db->fetchAll($sql, $params);
        
        // Format stories data
        $formattedStories = array_map(function($story) {
            return [
                'id' => (int)$story['id'],
                'media_type' => $story['media_type'],
                'media_url' => UPLOADS_URL . '/stories/' . $story['media_url'],
                'duration' => (int)$story['duration'],
                'views_count' => (int)$story['views_count'],
                'likes_count' => (int)$story['likes_count'],
                'is_viewed' => (bool)$story['is_viewed'],
                'created_at' => $story['created_at'],
                'expired_at' => $story['expired_at'],
                'author' => [
                    'id' => (int)$story['author_id'],
                    'username' => $story['author_username'],
                    'display_name' => $story['author_display_name'],
                    'avatar' => $story['author_avatar'] ? UPLOADS_URL . '/avatars/' . $story['author_avatar'] : null,
                    'is_verified' => (bool)$story['author_is_verified']
                ]
            ];
        }, $stories);
        
        sendSuccess($formattedStories);
        
    } else if ($method === 'POST') {
        // POST: Upload new story
        
        // Require authentication
        $user = require_auth();
        $userId = $user['id'];
        
        // Rate limiting
        if (!checkRateLimit($userId, 'upload_story', 5, 3600)) {
            sendError('Terlalu banyak story dalam 1 jam terakhir', 429);
            exit;
        }
        
        // Validasi file upload
        if (!isset($_FILES['media']) || $_FILES['media']['error'] !== UPLOAD_ERR_OK) {
            sendValidationError('File media wajib diupload');
            exit;
        }
        
        // Validasi tipe file untuk story (image/video)
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        $validation = validateUploadedFile($_FILES['media'], $allowedTypes);
        
        if (!$validation['valid']) {
            sendValidationError($validation['error']);
            exit;
        }
        
        $db = getDB();
        $db->beginTransaction();
        
        // Handle file upload
        $upload = handleFileUpload($_FILES['media'], 'stories');
        
        // Tentukan media type dan duration default
        $mediaType = strpos($validation['mime_type'], 'image/') === 0 ? 'image' : 'video';
        $duration = $mediaType === 'image' ? 5 : 15; // Default: 5s untuk image, 15s untuk video
        
        // Custom duration dari input
        if (isset($_POST['duration'])) {
            $customDuration = (int)$_POST['duration'];
            if ($customDuration > 0 && $customDuration <= 30) {
                $duration = $customDuration;
            }
        }
        
        // Hitung expired_at (24 jam dari sekarang)
        $expiredAt = date('Y-m-d H:i:s', time() + (STORY_EXPIRE_HOURS * 3600));
        
        // Insert story
        $sql = "INSERT INTO stories (user_id, media_type, media_url, duration, expired_at, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        
        $db->execute($sql, [$userId, $mediaType, $upload['filename'], $duration, $expiredAt]);
        $storyId = $db->lastInsertId();
        
        $db->commit();
        
        // Ambil story yang baru dibuat untuk response
        $newStory = $db->fetch("
            SELECT s.*, 
                   u.id as author_id, u.username as author_username,
                   u.display_name as author_display_name, u.avatar as author_avatar,
                   u.is_verified as author_is_verified
            FROM stories s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        ", [$storyId]);
        
        $formattedStory = [
            'id' => (int)$newStory['id'],
            'media_type' => $newStory['media_type'],
            'media_url' => UPLOADS_URL . '/stories/' . $newStory['media_url'],
            'duration' => (int)$newStory['duration'],
            'views_count' => 0,
            'likes_count' => 0,
            'is_viewed' => false,
            'created_at' => $newStory['created_at'],
            'expired_at' => $newStory['expired_at'],
            'author' => [
                'id' => (int)$newStory['author_id'],
                'username' => $newStory['author_username'],
                'display_name' => $newStory['author_display_name'],
                'avatar' => $newStory['author_avatar'] ? UPLOADS_URL . '/avatars/' . $newStory['author_avatar'] : null,
                'is_verified' => (bool)$newStory['author_is_verified']
            ]
        ];
        
        http_response_code(201);
        sendSuccess($formattedStory);
    }
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}