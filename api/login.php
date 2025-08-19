<?php
/**
 * User Login Endpoint
 * POST /api/login.php
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
    
    $email = sanitizeString($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validasi input
    if (!$email || !$password) {
        sendValidationError('Email dan password wajib diisi');
        exit;
    }
    
    if (!isValidEmail($email)) {
        sendValidationError('Format email tidak valid');
        exit;
    }
    
    $db = getDB();
    
    // Cek user berdasarkan email
    $user = $db->fetch(
        "SELECT id, username, email, display_name, bio, avatar, password_hash, is_verified, is_admin, is_active 
         FROM users WHERE email = ?",
        [$email]
    );
    
    if (!$user) {
        sendValidationError('Email atau password salah');
        exit;
    }
    
    if (!$user['is_active']) {
        sendValidationError('Akun tidak aktif');
        exit;
    }
    
    // Verifikasi password
    if (!Auth::verifyPassword($password, $user['password_hash'])) {
        sendValidationError('Email atau password salah');
        exit;
    }
    
    // Generate token dan simpan session
    $token = Auth::generateJWT($user['id']);
    Auth::saveSession($token, $user['id'], getUserAgent(), getClientIP());
    
    // Update last login
    $db->execute("UPDATE users SET last_login = NOW() WHERE id = ?", [$user['id']]);
    
    // Format user data untuk response
    $userData = formatUserData($user, true);
    
    $response = [
        'token' => $token,
        'user' => $userData
    ];
    
    sendSuccess($response);
    
} catch (Exception $e) {
    handleException($e);
}