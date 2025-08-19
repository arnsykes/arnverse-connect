<?php
/**
 * Hashtags Endpoint
 * GET /api/hashtags.php - Get trending hashtags
 */

require_once '_env.php';
require_once '_db.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET']);

try {
    [$page, $limit, $offset] = getPaginationParams();
    
    // Parameter untuk filter
    $search = sanitizeString($_GET['search'] ?? '');
    $trending = (bool)($_GET['trending'] ?? true);
    
    $db = getDB();
    
    // Build query
    $whereConditions = [];
    $params = [];
    
    if ($search) {
        $whereConditions[] = "name LIKE ?";
        $params[] = "%{$search}%";
    }
    
    $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
    
    // Order by trending score atau alphabetical
    $orderBy = $trending ? "trending_score DESC, posts_count DESC" : "name ASC";
    
    // Query hashtags
    $sql = "
        SELECT 
            id,
            name,
            posts_count,
            trending_score,
            last_used,
            created_at
        FROM hashtags
        {$whereClause}
        ORDER BY {$orderBy}
        LIMIT ? OFFSET ?
    ";
    
    $queryParams = array_merge($params, [$limit, $offset]);
    $hashtags = $db->fetchAll($sql, $queryParams);
    
    // Count total untuk pagination
    $countSql = "SELECT COUNT(*) as total FROM hashtags {$whereClause}";
    $totalResult = $db->fetch($countSql, $params);
    $total = $totalResult['total'];
    
    // Format hashtags data
    $formattedHashtags = array_map(function($hashtag) {
        return [
            'id' => (int)$hashtag['id'],
            'name' => $hashtag['name'],
            'posts_count' => (int)$hashtag['posts_count'],
            'trending_score' => (float)$hashtag['trending_score'],
            'last_used' => $hashtag['last_used'],
            'created_at' => $hashtag['created_at']
        ];
    }, $hashtags);
    
    // Response dengan pagination meta
    $meta = getPaginationMeta($page, $limit, $total);
    
    sendSuccess($formattedHashtags, $meta);
    
} catch (Exception $e) {
    handleException($e);
}