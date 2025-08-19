<?php
/**
 * Authentication Check Endpoint
 * GET /api/auth.php
 */

require_once '_env.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET']);

try {
    // Require authentication
    $user = require_auth();
    
    // Format user data untuk response
    $userData = formatUserData($user, true);
    
    sendSuccess(['user' => $userData]);
    
} catch (Exception $e) {
    handleException($e);
}