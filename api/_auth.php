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
     * Validate secure token (non-JWT)
     */
    public static function validateSecureToken($token) {
        if (!$token || strlen($token) !== 64) {
            return false;
        }
        return ctype_xdigit($token); // Valid hex string
    }

    /**
     * Check session validity using token hash
     */
    public static function isSessionValid($token, $userId) {
        $db = getDB();
        return $db->safeCheckSession(hash('sha256', $token), $userId);
    }

    /**
     * Remove session from database
     */
    public static function removeSession($token) {
        $db = getDB();
        return $db->safeDeleteSession(hash('sha256', $token));
    }

    /**
     * Ambil user berdasarkan ID
     */
    public static function getUserById($userId) {
        $db = getDB();
        $sql = "SELECT id, username, email, display_name, bio, avatar, is_verified, 
                       COALESCE(is_admin, 0) as is_admin, created_at 
                FROM users WHERE id = ?";
        
        // Only check is_active if column exists
        if ($db->columnExists('users', 'is_active')) {
            $sql .= " AND is_active = 1";
        }
        
        return $db->fetch($sql, [$userId]);
    }
}

/**
 * Middleware: Require Authentication
 * Supports both JWT and secure token authentication
 */
function require_auth() {
    $token = Auth::getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        sendResponse(false, null, 'Token tidak ditemukan');
        exit;
    }

    $user = null;
    
    // Try secure token first (64-char hex)
    if (Auth::validateSecureToken($token)) {
        // Extract user_id from session
        $db = getDB();
        if ($db->tableExists('user_sessions')) {
            $session = $db->fetch(
                "SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > NOW()",
                [hash('sha256', $token)]
            );
            
            if ($session) {
                $user = Auth::getUserById($session['user_id']);
            }
        }
    } else {
        // Fallback: Try JWT validation
        $payload = Auth::validateJWT($token);
        if ($payload && Auth::isSessionValid($token, $payload['uid'])) {
            $user = Auth::getUserById($payload['uid']);
        }
    }

    if (!$user) {
        http_response_code(401);
        sendResponse(false, null, 'Token tidak valid atau expired');
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