<?php
/**
 * Send Message Endpoint
 * POST /api/send_message.php
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
    if (!checkRateLimit($userId, 'send_message', 20, 60)) {
        sendError('Terlalu banyak pesan dalam 1 menit terakhir', 429);
        exit;
    }
    
    $db = getDB();
    
    // Check if chat tables exist
    if (!$db->tableExists('chats') || !$db->tableExists('messages')) {
        sendError('Fitur pesan belum tersedia', 503);
        exit;
    }
    
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $chatId = (int)($input['chat_id'] ?? 0);
    $targetUserId = (int)($input['target_user_id'] ?? 0);
    $content = sanitizeString($input['content'] ?? '', 1000);
    $replyToId = (int)($input['reply_to_id'] ?? 0) ?: null;
    
    // Validasi: harus ada chat_id ATAU target_user_id
    if (!$chatId && !$targetUserId) {
        sendValidationError('Chat ID atau Target User ID wajib diisi');
        exit;
    }
    
    // Validasi content atau media
    $hasMedia = isset($_FILES['media']) && $_FILES['media']['error'] === UPLOAD_ERR_OK;
    if (!$content && !$hasMedia) {
        sendValidationError('Content atau media wajib diisi');
        exit;
    }
    
    if ($content && !validateLength($content, 1, 1000)) {
        sendValidationError('Content pesan maksimal 1000 karakter');
        exit;
    }
    
    $db->beginTransaction();
    
    // Jika targetUserId ada, buat atau cari DM chat
    if ($targetUserId && !$chatId) {
        // Cek apakah target user ada
        $sql = "SELECT id FROM users WHERE id = ?";
        if ($db->columnExists('users', 'is_active')) {
            $sql .= " AND is_active = 1";
        }
        
        $targetUser = $db->fetch($sql, [$targetUserId]);
        if (!$targetUser) {
            sendNotFound('Target user tidak ditemukan');
            exit;
        }
        
        // Cari existing DM chat
        $existingChat = $db->fetch("
            SELECT c.id
            FROM chats c
            JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = ?
            JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = ?
            WHERE c.type = 'dm'
            LIMIT 1
        ", [$userId, $targetUserId]);
        
        if ($existingChat) {
            $chatId = $existingChat['id'];
        } else {
            // Buat DM chat baru
            $db->execute("INSERT INTO chats (type, created_at, updated_at) VALUES ('dm', NOW(), NOW())");
            $chatId = $db->lastInsertId();
            
            // Tambah participants
            $db->execute("INSERT INTO chat_participants (chat_id, user_id, joined_at) VALUES (?, ?, NOW())", [$chatId, $userId]);
            $db->execute("INSERT INTO chat_participants (chat_id, user_id, joined_at) VALUES (?, ?, NOW())", [$chatId, $targetUserId]);
        }
    }
    
    // Cek apakah user adalah participant dari chat ini
    $participantSql = "SELECT id FROM chat_participants WHERE chat_id = ? AND user_id = ?";
    if ($db->columnExists('chat_participants', 'is_active')) {
        $participantSql .= " AND is_active = 1";
    }
    
    $participant = $db->fetch($participantSql, [$chatId, $userId]);
    
    if (!$participant) {
        sendUnauthorized('Anda tidak memiliki akses ke chat ini');
        exit;
    }
    
    // Handle media upload jika ada
    $mediaUrl = null;
    $messageType = 'text';
    
    if ($hasMedia) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'];
        $upload = handleFileUpload($_FILES['media'], 'messages');
        $mediaUrl = $upload['filename'];
        
        // Tentukan message type berdasarkan mime type
        if (strpos($upload['mime_type'], 'image/') === 0) {
            $messageType = 'image';
        } elseif (strpos($upload['mime_type'], 'video/') === 0) {
            $messageType = 'video';
        } elseif (strpos($upload['mime_type'], 'audio/') === 0) {
            $messageType = 'audio';
        }
    }
    
    // Insert message
    $sql = "INSERT INTO messages (chat_id, user_id, content, media_url, message_type, reply_to_id, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $db->execute($sql, [$chatId, $userId, $content, $mediaUrl, $messageType, $replyToId]);
    $messageId = $db->lastInsertId();
    
    // Update chat updated_at
    $db->execute("UPDATE chats SET updated_at = NOW() WHERE id = ?", [$chatId]);
    
    // Create notifications untuk participants lain (if notifications table exists)
    if ($db->tableExists('notifications')) {
        $otherParticipantsSql = "SELECT user_id FROM chat_participants WHERE chat_id = ? AND user_id != ?";
        if ($db->columnExists('chat_participants', 'is_active')) {
            $otherParticipantsSql .= " AND is_active = 1";
        }
        
        $otherParticipants = $db->fetchAll($otherParticipantsSql, [$chatId, $userId]);
        
        foreach ($otherParticipants as $participant) {
            $db->execute(
                "INSERT INTO notifications (user_id, type, actor_id, chat_id, message_id, created_at) 
                 VALUES (?, 'message', ?, ?, ?, NOW())",
                [$participant['user_id'], $userId, $chatId, $messageId]
            );
        }
    }
    
    $db->commit();
    
    // Ambil message yang baru dibuat untuk response
    $newMessage = $db->fetch("
        SELECT m.*, 
               u.id as sender_id, u.username as sender_username,
               u.display_name as sender_display_name, u.avatar as sender_avatar,
               u.is_verified as sender_is_verified
        FROM messages m 
        JOIN users u ON m.user_id = u.id 
        WHERE m.id = ?
    ", [$messageId]);
    
    $formattedMessage = [
        'id' => (int)$newMessage['id'],
        'chat_id' => (int)$newMessage['chat_id'],
        'content' => $newMessage['content'],
        'media_url' => $newMessage['media_url'] ? UPLOADS_URL . '/messages/' . $newMessage['media_url'] : null,
        'message_type' => $newMessage['message_type'],
        'reply_to_id' => $newMessage['reply_to_id'] ? (int)$newMessage['reply_to_id'] : null,
        'created_at' => $newMessage['created_at'],
        'updated_at' => $newMessage['updated_at'],
        'sender' => [
            'id' => (int)$newMessage['sender_id'],
            'username' => $newMessage['sender_username'],
            'display_name' => $newMessage['sender_display_name'],
            'avatar' => $newMessage['sender_avatar'] ? UPLOADS_URL . '/avatars/' . $newMessage['sender_avatar'] : null,
            'is_verified' => (bool)$newMessage['sender_is_verified']
        ]
    ];
    
    http_response_code(201);
    sendSuccess($formattedMessage);
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}