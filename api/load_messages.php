<?php
/**
 * Load Messages from Chat Endpoint
 * GET /api/load_messages.php
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET']);

try {
    // Require authentication
    $user = require_auth();
    $userId = $user['id'];
    
    // Get parameters
    $chatId = (int)($_GET['chat_id'] ?? 0);
    
    if (!$chatId) {
        sendValidationError('Chat ID wajib diisi');
        exit;
    }
    
    [$page, $limit, $offset] = getPaginationParams();
    
    $db = getDB();
    
    // Cek apakah user adalah participant dari chat ini
    $participant = $db->fetch(
        "SELECT id FROM chat_participants WHERE chat_id = ? AND user_id = ? AND is_active = 1",
        [$chatId, $userId]
    );
    
    if (!$participant) {
        sendUnauthorized('Anda tidak memiliki akses ke chat ini');
        exit;
    }
    
    // Query messages dari chat
    $sql = "
        SELECT 
            m.*,
            u.id as sender_id,
            u.username as sender_username,
            u.display_name as sender_display_name,
            u.avatar as sender_avatar,
            u.is_verified as sender_is_verified
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.chat_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $messages = $db->fetchAll($sql, [$chatId, $limit, $offset]);
    
    // Count total untuk pagination
    $totalResult = $db->fetch("SELECT COUNT(*) as total FROM messages WHERE chat_id = ?", [$chatId]);
    $total = $totalResult['total'];
    
    // Format messages data
    $formattedMessages = array_map(function($message) {
        return [
            'id' => (int)$message['id'],
            'chat_id' => (int)$message['chat_id'],
            'content' => $message['content'],
            'media_url' => $message['media_url'] ? UPLOADS_URL . '/messages/' . $message['media_url'] : null,
            'message_type' => $message['message_type'],
            'reply_to_id' => $message['reply_to_id'] ? (int)$message['reply_to_id'] : null,
            'created_at' => $message['created_at'],
            'updated_at' => $message['updated_at'],
            'sender' => [
                'id' => (int)$message['sender_id'],
                'username' => $message['sender_username'],
                'display_name' => $message['sender_display_name'],
                'avatar' => $message['sender_avatar'] ? UPLOADS_URL . '/avatars/' . $message['sender_avatar'] : null,
                'is_verified' => (bool)$message['sender_is_verified']
            ]
        ];
    }, $messages);
    
    // Reverse array untuk urutan ascending (newest at bottom)
    $formattedMessages = array_reverse($formattedMessages);
    
    // Update last_read_at untuk participant
    $db->execute(
        "UPDATE chat_participants SET last_read_at = NOW() WHERE chat_id = ? AND user_id = ?",
        [$chatId, $userId]
    );
    
    // Response dengan pagination meta
    $meta = getPaginationMeta($page, $limit, $total);
    
    sendSuccess($formattedMessages, $meta);
    
} catch (Exception $e) {
    handleException($e);
}