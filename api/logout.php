<?php
/**
 * User Logout Endpoint
 * POST /api/logout.php
 */

require_once '_env.php';
require_once '_auth.php';
require_once '_response.php';

// Validasi method
validateMethod(['POST']);

try {
    $token = Auth::getBearerToken();
    
    if ($token) {
        // Hapus session dari database
        Auth::removeSession($token);
    }
    
    sendSuccess(['message' => 'Logout berhasil']);
    
} catch (Exception $e) {
    handleException($e);
}