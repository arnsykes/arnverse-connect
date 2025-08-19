<?php
/**
 * Get Comments for Post Endpoint
 * GET /api/get_comments.php
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET']);

try {
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
    
    // Get parameters
    $postId = (int)($_GET['post_id'] ?? 0);
    $parentId = isset($_GET['parent_id']) ? (int)$_GET['parent_id'] : null;
    
    if (!$postId) {
        sendValidationError('Post ID wajib diisi');
        exit;
    }
    
    [$page, $limit, $offset] = getPaginationParams();
    
    $db = getDB();
    
    // Cek apakah post ada
    $post = $db->fetch("SELECT id FROM posts WHERE id = ? AND is_active = 1", [$postId]);
    if (!$post) {
        sendNotFound('Post tidak ditemukan');
        exit;
    }
    
    // Build query berdasarkan apakah ambil top-level comments atau replies
    $whereConditions = ["c.post_id = ?"];
    $params = [$postId];
    
    if ($parentId === null) {
        // Top-level comments only
        $whereConditions[] = "c.parent_id IS NULL";
    } else {
        // Replies to specific comment
        $whereConditions[] = "c.parent_id = ?";
        $params[] = $parentId;
    }
    
    $whereClause = implode(" AND ", $whereConditions);
    
    // Query comments
    $sql = "
        SELECT 
            c.*,
            u.id as author_id,
            u.username as author_username,
            u.display_name as author_display_name,
            u.avatar as author_avatar,
            u.is_verified as author_is_verified,
            " . ($currentUserId ? "
            CASE WHEN l.user_id IS NOT NULL THEN 1 ELSE 0 END as is_liked
            " : "0 as is_liked") . ",
            (SELECT COUNT(*) FROM comments WHERE parent_id = c.id) as replies_count
        FROM comments c
        JOIN users u ON c.user_id = u.id
        " . ($currentUserId ? "
        LEFT JOIN likes l ON c.id = l.likeable_id AND l.likeable_type = 'comment' AND l.user_id = ?
        " : "") . "
        WHERE {$whereClause}
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
    ";
    
    $queryParams = [];
    if ($currentUserId) {
        $queryParams[] = $currentUserId;
    }
    $queryParams = array_merge($queryParams, $params, [$limit, $offset]);
    
    $comments = $db->fetchAll($sql, $queryParams);
    
    // Count total untuk pagination
    $countSql = "SELECT COUNT(*) as total FROM comments c WHERE {$whereClause}";
    $totalResult = $db->fetch($countSql, $params);
    $total = $totalResult['total'];
    
    // Format comments data
    $formattedComments = array_map(function($comment) {
        return [
            'id' => (int)$comment['id'],
            'post_id' => (int)$comment['post_id'],
            'parent_id' => $comment['parent_id'] ? (int)$comment['parent_id'] : null,
            'content' => $comment['content'],
            'mentions' => $comment['mentions'] ? json_decode($comment['mentions'], true) : [],
            'likes_count' => (int)$comment['likes_count'],
            'replies_count' => (int)$comment['replies_count'],
            'is_liked' => (bool)$comment['is_liked'],
            'created_at' => $comment['created_at'],
            'updated_at' => $comment['updated_at'],
            'author' => [
                'id' => (int)$comment['author_id'],
                'username' => $comment['author_username'],
                'display_name' => $comment['author_display_name'],
                'avatar' => $comment['author_avatar'] ? UPLOADS_URL . '/avatars/' . $comment['author_avatar'] : null,
                'is_verified' => (bool)$comment['author_is_verified']
            ]
        ];
    }, $comments);
    
    // Response dengan pagination meta
    $meta = getPaginationMeta($page, $limit, $total);
    
    sendSuccess($formattedComments, $meta);
    
} catch (Exception $e) {
    handleException($e);
}