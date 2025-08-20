<?php
/**
 * Feed Posts Endpoint
 * GET /api/feed.php
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET']);

try {
    // Optional authentication untuk feed publik
    $currentUser = null;
    $token = Auth::getBearerToken();
    if ($token) {
        $payload = Auth::validateJWT($token);
        if ($payload && Auth::isSessionValid($token, $payload['uid'])) {
            $currentUser = Auth::getUserById($payload['uid']);
        }
    }
    
    $currentUserId = $currentUser ? $currentUser['id'] : null;
    
    // Get pagination parameters
    [$page, $limit, $offset] = getPaginationParams();
    
    // Search query
    $search = sanitizeString($_GET['q'] ?? '');
    
    $db = getDB();
    
    // Build query
    $whereConditions = [];
    $params = [];
    
    // Only check is_active if column exists
    $db = getDB();
    if ($db->columnExists('posts', 'is_active')) {
        $whereConditions[] = "p.is_active = 1";
    }
    
    if ($search) {
        $whereConditions[] = "(p.content LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)";
        $searchParam = "%{$search}%";
        $params = array_merge($params, [$searchParam, $searchParam, $searchParam]);
    }
    
    // Add default condition if no conditions
    if (empty($whereConditions)) {
        $whereConditions[] = "1=1";
    }
    
    // Jika user login, prioritaskan posts dari following
    $orderBy = "p.created_at DESC";
    if ($currentUserId) {
        $orderBy = "
            CASE 
                WHEN f.following_id IS NOT NULL THEN 0 
                ELSE 1 
            END,
            p.created_at DESC
        ";
    }
    
    $whereClause = implode(" AND ", $whereConditions);
    
    // Safe limit and offset (no placeholders for EMULATE_PREPARES=false)
    $safeLimit = max(1, min(100, $limit));
    $safeOffset = max(0, $offset);
    
    // Query posts dengan join ke users dan optional following
    $sql = "
        SELECT 
            p.*,
            u.id as author_id,
            u.username as author_username,
            u.display_name as author_display_name,
            u.avatar as author_avatar,
            u.is_verified as author_is_verified,
            GROUP_CONCAT(DISTINCT h.name) as hashtags,
            " . ($currentUserId ? "
            CASE WHEN l.user_id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
            CASE WHEN b.user_id IS NOT NULL THEN 1 ELSE 0 END as is_saved
            " : "0 as is_liked, 0 as is_saved") . "
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN post_hashtags ph ON p.id = ph.post_id
        LEFT JOIN hashtags h ON ph.hashtag_id = h.id
        " . ($currentUserId ? "
        LEFT JOIN follows f ON u.id = f.following_id AND f.follower_id = ?
        LEFT JOIN likes l ON p.id = l.post_id AND l.user_id = ?
        LEFT JOIN bookmarks b ON p.id = b.post_id AND b.user_id = ?
        " : "") . "
        WHERE {$whereClause}
        GROUP BY p.id
        ORDER BY {$orderBy}
        LIMIT {$safeLimit} OFFSET {$safeOffset}
    ";
    
    // Prepare parameters (no limit/offset in params)
    $queryParams = [];
    if ($currentUserId) {
        $queryParams = [$currentUserId, $currentUserId, $currentUserId];
    }
    $queryParams = array_merge($queryParams, $params);
    
    $posts = $db->fetchAll($sql, $queryParams);
    
    // Count total untuk pagination
    $countSql = "
        SELECT COUNT(DISTINCT p.id) as total
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE {$whereClause}
    ";
    $countParams = $params;
    $totalResult = $db->fetch($countSql, $countParams);
    $total = $totalResult['total'];
    
    // Format posts data
    $formattedPosts = array_map(function($post) use ($currentUserId) {
        return formatPostData($post, $currentUserId);
    }, $posts);
    
    // Response dengan pagination meta
    $meta = getPaginationMeta($page, $limit, $total);
    
    sendSuccess($formattedPosts, $meta);
    
} catch (Exception $e) {
    handleException($e);
}