<?php
/**
 * Create Group Chat Endpoint
 * POST /api/create_group.php
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
    if (!checkRateLimit($userId, 'create_group', 3, 3600)) {
        sendError('Terlalu banyak grup dibuat dalam 1 jam terakhir', 429);
        exit;
    }
    
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $name = sanitizeString($input['name'] ?? '', 100);
    $participantIds = $input['participant_ids'] ?? [];
    
    // Validasi input
    if (!$name || !validateLength($name, 1, 100)) {
        sendValidationError('Nama grup wajib diisi (max 100 karakter)');
        exit;
    }
    
    if (!is_array($participantIds) || count($participantIds) < 1) {
        sendValidationError('Minimal 1 participant harus dipilih');
        exit;
    }
    
    if (count($participantIds) > 50) {
        sendValidationError('Maksimal 50 participants per grup');
        exit;
    }
    
    $db = getDB();
    $db->beginTransaction();
    
    // Validasi bahwa semua participant IDs adalah user yang valid
    $placeholders = str_repeat('?,', count($participantIds) - 1) . '?';
    $validUsers = $db->fetchAll(
        "SELECT id FROM users WHERE id IN ({$placeholders}) AND is_active = 1",
        $participantIds
    );
    
    if (count($validUsers) !== count($participantIds)) {
        sendValidationError('Beberapa participant tidak valid');
        exit;
    }
    
    // Buat group chat
    $sql = "INSERT INTO chats (type, name, created_by, created_at, updated_at) VALUES ('group', ?, ?, NOW(), NOW())";
    $db->execute($sql, [$name, $userId]);
    $chatId = $db->lastInsertId();
    
    // Tambah creator sebagai participant pertama
    $db->execute(
        "INSERT INTO chat_participants (chat_id, user_id, role, joined_at) VALUES (?, ?, 'admin', NOW())",
        [$chatId, $userId]
    );
    
    // Tambah participants lain
    foreach ($participantIds as $participantId) {
        if ($participantId != $userId) { // Skip creator karena sudah ditambah
            $db->execute(
                "INSERT INTO chat_participants (chat_id, user_id, role, joined_at) VALUES (?, ?, 'member', NOW())",
                [$chatId, $participantId]
            );
            
            // Create notification untuk participant yang diundang
            $db->execute(
                "INSERT INTO notifications (user_id, type, actor_id, chat_id, created_at) 
                 VALUES (?, 'group_invite', ?, ?, NOW())",
                [$participantId, $userId, $chatId]
            );
        }
    }
    
    $db->commit();
    
    // Ambil data group yang baru dibuat
    $newGroup = $db->fetch("
        SELECT c.*, u.username as creator_username
        FROM chats c 
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = ?
    ", [$chatId]);
    
    // Ambil participants
    $participants = $db->fetchAll("
        SELECT u.id, u.username, u.display_name, u.avatar, u.is_verified, cp.role
        FROM chat_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.chat_id = ? AND cp.is_active = 1
    ", [$chatId]);
    
    $formattedParticipants = array_map(function($p) {
        return [
            'id' => (int)$p['id'],
            'username' => $p['username'],
            'display_name' => $p['display_name'],
            'avatar' => $p['avatar'] ? UPLOADS_URL . '/avatars/' . $p['avatar'] : null,
            'is_verified' => (bool)$p['is_verified'],
            'role' => $p['role']
        ];
    }, $participants);
    
    $formattedGroup = [
        'id' => (int)$newGroup['id'],
        'type' => $newGroup['type'],
        'name' => $newGroup['name'],
        'created_by' => (int)$newGroup['created_by'],
        'creator_username' => $newGroup['creator_username'],
        'participants_count' => count($formattedParticipants),
        'participants' => $formattedParticipants,
        'created_at' => $newGroup['created_at'],
        'updated_at' => $newGroup['updated_at']
    ];
    
    http_response_code(201);
    sendSuccess($formattedGroup);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}