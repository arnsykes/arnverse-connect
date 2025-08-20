<?php
/**
 * Inbox - List Chats Endpoint
 * GET /api/inbox.php
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
    
    [$page, $limit, $offset] = getPaginationParams();
    
    $db = getDB();
    
    // Check if chat tables exist
    if (!$db->tableExists('chats') || !$db->tableExists('chat_participants')) {
        // Return safe fallback response
        sendSuccess([], ['page' => 1, 'limit' => 20, 'total' => 0]);
        exit;
    }
    
    // Safe limit and offset
    $safeLimit = max(1, min(100, $limit));
    $safeOffset = max(0, $offset);
    
    // Query chats yang user ikuti
    $sql = "
        SELECT 
            c.id,
            c.type,
            c.name,
            c.created_at,
            c.updated_at,
            (SELECT COUNT(*) FROM messages WHERE chat_id = c.id) as messages_count,
            (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
            (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
            (SELECT u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_sender,
            (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.id AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count
        FROM chats c
        JOIN chat_participants cp ON c.id = cp.chat_id
        WHERE cp.user_id = ? AND (cp.is_active IS NULL OR cp.is_active = 1)
        ORDER BY last_message_at DESC, c.updated_at DESC
        LIMIT {$safeLimit} OFFSET {$safeOffset}
    ";
    
    $chats = $db->fetchAll($sql, [$userId]);
    
    // Count total untuk pagination
    $totalResult = $db->fetch(
        "SELECT COUNT(*) as total FROM chats c 
         JOIN chat_participants cp ON c.id = cp.chat_id 
         WHERE cp.user_id = ? AND (cp.is_active IS NULL OR cp.is_active = 1)",
        [$userId]
    );
    $total = $totalResult['total'];
    
    // Format chats data
    $formattedChats = [];
    
    foreach ($chats as $chat) {
        // Untuk DM, ambil info user lawan
        $otherParticipant = null;
        if ($chat['type'] === 'dm') {
            $otherParticipant = $db->fetch("
                SELECT u.id, u.username, u.display_name, u.avatar, u.is_verified
                FROM chat_participants cp
                JOIN users u ON cp.user_id = u.id
                WHERE cp.chat_id = ? AND cp.user_id != ? AND (cp.is_active IS NULL OR cp.is_active = 1)
                LIMIT 1
            ", [$chat['id'], $userId]);
        }
        
        // Nama chat: untuk DM pakai nama user lawan, untuk group pakai nama group
        $chatName = $chat['name'];
        if ($chat['type'] === 'dm' && $otherParticipant) {
            $chatName = $otherParticipant['display_name'] ?: $otherParticipant['username'];
        }
        
        $formattedChats[] = [
            'id' => (int)$chat['id'],
            'type' => $chat['type'],
            'name' => $chatName,
            'messages_count' => (int)$chat['messages_count'],
            'unread_count' => (int)$chat['unread_count'],
            'last_message' => $chat['last_message'],
            'last_message_at' => $chat['last_message_at'],
            'last_sender' => $chat['last_sender'],
            'created_at' => $chat['created_at'],
            'updated_at' => $chat['updated_at'],
            'other_participant' => $otherParticipant ? [
                'id' => (int)$otherParticipant['id'],
                'username' => $otherParticipant['username'],
                'display_name' => $otherParticipant['display_name'],
                'avatar' => $otherParticipant['avatar'] ? UPLOADS_URL . '/avatars/' . $otherParticipant['avatar'] : null,
                'is_verified' => (bool)$otherParticipant['is_verified']
            ] : null
        ];
    }
    
    // Response dengan pagination meta
    $meta = getPaginationMeta($page, $limit, $total);
    
    sendSuccess($formattedChats, $meta);
    
} catch (Exception $e) {
    handleException($e);
}