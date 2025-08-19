<?php
/**
 * Notifications Endpoint
 * GET /api/notifications.php - List notifications
 * POST /api/notifications.php - Mark as read
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET', 'POST']);

try {
    // Require authentication
    $user = require_auth();
    $userId = $user['id'];
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // GET: List notifications
        
        [$page, $limit, $offset] = getPaginationParams();
        
        $db = getDB();
        
        // Query notifications untuk user
        $sql = "
            SELECT 
                n.*,
                actor.username as actor_username,
                actor.display_name as actor_display_name,
                actor.avatar as actor_avatar,
                actor.is_verified as actor_is_verified,
                p.content as post_content,
                c.content as comment_content,
                s.media_type as story_media_type,
                ch.name as chat_name
            FROM notifications n
            LEFT JOIN users actor ON n.actor_id = actor.id
            LEFT JOIN posts p ON n.post_id = p.id
            LEFT JOIN comments c ON n.comment_id = c.id
            LEFT JOIN stories s ON n.story_id = s.id
            LEFT JOIN chats ch ON n.chat_id = ch.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        $notifications = $db->fetchAll($sql, [$userId, $limit, $offset]);
        
        // Count total untuk pagination
        $totalResult = $db->fetch("SELECT COUNT(*) as total FROM notifications WHERE user_id = ?", [$userId]);
        $total = $totalResult['total'];
        
        // Count unread
        $unreadResult = $db->fetch("SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0", [$userId]);
        $unreadCount = $unreadResult['unread'];
        
        // Format notifications data
        $formattedNotifications = array_map(function($notif) {
            $formatted = [
                'id' => (int)$notif['id'],
                'type' => $notif['type'],
                'is_read' => (bool)$notif['is_read'],
                'created_at' => $notif['created_at'],
                'actor' => null,
                'post' => null,
                'comment' => null,
                'story' => null,
                'chat' => null
            ];
            
            // Actor info
            if ($notif['actor_id']) {
                $formatted['actor'] = [
                    'id' => (int)$notif['actor_id'],
                    'username' => $notif['actor_username'],
                    'display_name' => $notif['actor_display_name'],
                    'avatar' => $notif['actor_avatar'] ? UPLOADS_URL . '/avatars/' . $notif['actor_avatar'] : null,
                    'is_verified' => (bool)$notif['actor_is_verified']
                ];
            }
            
            // Related content info
            if ($notif['post_id']) {
                $formatted['post'] = [
                    'id' => (int)$notif['post_id'],
                    'content' => $notif['post_content'] ? substr($notif['post_content'], 0, 100) : null
                ];
            }
            
            if ($notif['comment_id']) {
                $formatted['comment'] = [
                    'id' => (int)$notif['comment_id'],
                    'content' => $notif['comment_content'] ? substr($notif['comment_content'], 0, 100) : null
                ];
            }
            
            if ($notif['story_id']) {
                $formatted['story'] = [
                    'id' => (int)$notif['story_id'],
                    'media_type' => $notif['story_media_type']
                ];
            }
            
            if ($notif['chat_id']) {
                $formatted['chat'] = [
                    'id' => (int)$notif['chat_id'],
                    'name' => $notif['chat_name']
                ];
            }
            
            return $formatted;
        }, $notifications);
        
        // Response dengan pagination meta
        $meta = getPaginationMeta($page, $limit, $total);
        $meta['unread_count'] = (int)$unreadCount;
        
        sendSuccess($formattedNotifications, $meta);
        
    } else if ($method === 'POST') {
        // POST: Mark notifications as read
        
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }
        
        $notificationIds = $input['notification_ids'] ?? [];
        $markAllAsRead = (bool)($input['mark_all_as_read'] ?? false);
        
        $db = getDB();
        
        if ($markAllAsRead) {
            // Mark all notifications as read
            $updated = $db->execute(
                "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0",
                [$userId]
            );
            
            $message = "Semua notifikasi ditandai sebagai dibaca";
            
        } else {
            // Mark specific notifications as read
            if (!is_array($notificationIds) || empty($notificationIds)) {
                sendValidationError('notification_ids wajib diisi');
                exit;
            }
            
            $placeholders = str_repeat('?,', count($notificationIds) - 1) . '?';
            $params = array_merge([$userId], $notificationIds);
            
            $updated = $db->execute(
                "UPDATE notifications SET is_read = 1, read_at = NOW() 
                 WHERE user_id = ? AND id IN ({$placeholders}) AND is_read = 0",
                $params
            );
            
            $message = "{$updated} notifikasi ditandai sebagai dibaca";
        }
        
        // Get updated unread count
        $unreadResult = $db->fetch("SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0", [$userId]);
        $unreadCount = $unreadResult['unread'];
        
        sendSuccess([
            'message' => $message,
            'updated_count' => (int)$updated,
            'unread_count' => (int)$unreadCount
        ]);
    }
    
} catch (Exception $e) {
    handleException($e);
}