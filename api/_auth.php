<?php
/**
 * Authentication Helper untuk ARNVERSE
 * Handle JWT, password hashing, dan session management
 */

require_once '_env.php';
require_once '_db.php';
require_once '_response.php';

class Auth {
    
    /**
     * Hash password menggunakan bcrypt
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verifikasi password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Generate JWT Token
     */
    public static function generateJWT($userId) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'uid' => $userId,
            'iat' => time(),
            'exp' => time() + (JWT_EXPIRE_HOURS * 3600)
        ]);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    /**
     * Validasi JWT Token
     */
    public static function validateJWT($token) {
        if (!$token) return false;

        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;

        [$header, $payload, $signature] = $parts;

        // Verifikasi signature
        $validSignature = hash_hmac('sha256', $header . '.' . $payload, JWT_SECRET, true);
        $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));

        if (!hash_equals($signature, $validSignature)) return false;

        // Decode payload
        $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
        
        if (!$payloadData || !isset($payloadData['exp']) || $payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Ambil Bearer token dari header
     */
    public static function getBearerToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    /**
     * Simpan session ke database
     */
    public static function saveSession($token, $userId, $userAgent = null, $ipAddress = null) {
        $db = getDB();
        $expiredAt = date('Y-m-d H:i:s', time() + (JWT_EXPIRE_HOURS * 3600));
        
        $sql = "INSERT INTO user_sessions (token, user_id, user_agent, ip_address, expired_at, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())";
        
        return $db->execute($sql, [$token, $userId, $userAgent, $ipAddress, $expiredAt]);
    }

    /**
     * Hapus session dari database
     */
    public static function removeSession($token) {
        $db = getDB();
        return $db->execute("DELETE FROM user_sessions WHERE token = ?", [$token]);
    }

    /**
     * Cek apakah session masih valid di database
     */
    public static function isSessionValid($token, $userId) {
        $db = getDB();
        $session = $db->fetch(
            "SELECT id FROM user_sessions WHERE token = ? AND user_id = ? AND expired_at > NOW()",
            [$token, $userId]
        );
        return $session !== false;
    }

    /**
     * Ambil user berdasarkan ID
     */
    public static function getUserById($userId) {
        $db = getDB();
        return $db->fetch(
            "SELECT id, username, email, display_name, bio, avatar, is_verified, is_admin, created_at 
             FROM users WHERE id = ? AND is_active = 1",
            [$userId]
        );
    }
}

/**
 * Middleware: Require Authentication
 * Panggil di awal setiap endpoint yang butuh auth
 */
function require_auth() {
    $token = Auth::getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        sendResponse(false, null, 'Token tidak ditemukan');
        exit;
    }

    $payload = Auth::validateJWT($token);
    if (!$payload) {
        http_response_code(401);
        sendResponse(false, null, 'Token tidak valid atau expired');
        exit;
    }

    // Cek session di database
    if (!Auth::isSessionValid($token, $payload['uid'])) {
        http_response_code(401);
        sendResponse(false, null, 'Session tidak valid');
        exit;
    }

    // Ambil data user
    $user = Auth::getUserById($payload['uid']);
    if (!$user) {
        http_response_code(401);
        sendResponse(false, null, 'User tidak ditemukan');
        exit;
    }

    // Set global variables
    $GLOBALS['current_user'] = $user;
    $GLOBALS['current_token'] = $token;
    
    return $user;
}

/**
 * Helper: Get current authenticated user
 */
function getCurrentUser() {
    return $GLOBALS['current_user'] ?? null;
}

/**
 * Helper: Get current token
 */
function getCurrentToken() {
    return $GLOBALS['current_token'] ?? null;
}