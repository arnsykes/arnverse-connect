<?php
/**
 * User Registration Endpoint
 * POST /api/register.php
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['POST']);

try {
    // Ambil input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $username = sanitizeString($input['username'] ?? '');
    $email = sanitizeString($input['email'] ?? '');
    $displayName = sanitizeString($input['display_name'] ?? $username);
    $password = $input['password'] ?? '';
    
    // Validasi input
    if (!$username || !$email || !$password) {
        sendValidationError('Username, email, dan password wajib diisi');
        exit;
    }
    
    if (!validateLength($username, 3, 30)) {
        sendValidationError('Username harus 3-30 karakter');
        exit;
    }
    
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        sendValidationError('Username hanya boleh huruf, angka, dan underscore');
        exit;
    }
    
    if (!isValidEmail($email)) {
        sendValidationError('Format email tidak valid');
        exit;
    }
    
    if (!validateLength($password, 6, 100)) {
        sendValidationError('Password harus 6-100 karakter');
        exit;
    }
    
    if (!validateLength($displayName, 1, 100)) {
        sendValidationError('Display name harus 1-100 karakter');
        exit;
    }
    
    $db = getDB();
    
    // Cek username sudah ada
    $existingUser = $db->fetch(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [$username, $email]
    );
    
    if ($existingUser) {
        sendValidationError('Username atau email sudah digunakan');
        exit;
    }
    
    // Hash password
    $passwordHash = Auth::hashPassword($password);
    
    // Insert user baru
    $db->beginTransaction();
    
    $sql = "INSERT INTO users (username, email, display_name, password_hash, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())";
    
    $db->execute($sql, [$username, $email, $displayName, $passwordHash]);
    $userId = $db->lastInsertId();
    
    // Insert default user settings
    $settingsSql = "INSERT INTO user_settings (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())";
    $db->execute($settingsSql, [$userId]);
    
    $db->commit();
    
    // Generate token dan simpan session
    $token = Auth::generateJWT($userId);
    Auth::saveSession($token, $userId, getUserAgent(), getClientIP());
    
    // Ambil data user untuk response
    $user = Auth::getUserById($userId);
    $userData = formatUserData($user, true);
    
    $response = [
        'token' => $token,
        'user' => $userData
    ];
    
    http_response_code(201);
    sendSuccess($response);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}