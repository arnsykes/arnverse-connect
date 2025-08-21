<?php
/**
 * Feed Posts Endpoint
 * GET /api/feed.php - Ambil daftar posts dengan pagination
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Handle preflight
handlePreflight();

// Validate method
validateMethod(['GET']);

try {
    // Optional authentication
    $currentUser = Auth::optionalAuth();
    $currentUserId = $currentUser ? $currentUser['id'] : null;
    
    // Get pagination parameters
    [$page, $limit, $offset] = getPaginationParams();
    
    // Search query
    $search = sanitizeString($_GET['q'] ?? '');
    
    $db = getDB();
    
    // Build query conditions
    $whereConditions = ['p.is_active = 1'];
    $params = [];
    
    if ($search) {
        $whereConditions[] = "(p.content LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)";
        $searchParam = "%{$search}%";
        $params = array_merge($params, [$searchParam, $searchParam, $searchParam]);
    }
    
    // Order by: prioritas posts dari following jika user login
    $orderBy = "p.created_at DESC";
    $followingJoin = "";
    
    if ($currentUserId) {
        $followingJoin = "LEFT JOIN follows f ON u.id = f.following_id AND f.follower_id = ?";
        $orderBy = "CASE WHEN f.following_id IS NOT NULL THEN 0 ELSE 1 END, p.created_at DESC";
        array_unshift($params, $currentUserId); // Add to beginning for following join
    }
    
    $whereClause = implode(" AND ", $whereConditions);
    
    // Main query with all joins
    $sql = "
        SELECT 
            p.id,
            p.content,
            p.media_urls,
            p.hashtags,
            p.likes_count,
            p.comments_count,
            p.shares_count,
            p.views_count,
            p.created_at,
            p.updated_at,
            u.id as author_id,
            u.username as author_username,
            u.display_name as author_display_name,
            u.avatar as author_avatar,
            u.is_verified as author_is_verified,
            u.is_exclusive as author_is_exclusive,
            u.is_private as author_is_private"
            . ($currentUserId ? ",
            CASE WHEN l.user_id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
            CASE WHEN b.user_id IS NOT NULL THEN 1 ELSE 0 END as is_saved" : ",
            0 as is_liked,
            0 as is_saved") . "
        FROM posts p
        JOIN users u ON p.user_id = u.id
        {$followingJoin}"
        . ($currentUserId ? "
        LEFT JOIN likes l ON l.post_id = p.id AND l.user_id = ?
        LEFT JOIN bookmarks b ON b.post_id = p.id AND b.user_id = ?" : "") . "
        WHERE {$whereClause}
        ORDER BY {$orderBy}
        LIMIT ? OFFSET ?
    ";
    
    // Prepare final parameters
    $queryParams = $params;
    if ($currentUserId) {
        // Add current user ID for likes and bookmarks join
        $queryParams[] = $currentUserId;
        $queryParams[] = $currentUserId;
    }
    $queryParams[] = $limit;
    $queryParams[] = $offset;
    
    $posts = $db->fetchAll($sql, $queryParams);
    
    // Count total
    $countSql = "
        SELECT COUNT(DISTINCT p.id) as total
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE {$whereClause}
    ";
    $countParams = array_slice($params, $currentUserId ? 1 : 0); // Remove following join param for count
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