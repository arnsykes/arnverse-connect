<?php
/**
 * Health Check Endpoint untuk ARNVERSE API
 * GET /api/health.php
 */

require_once '_env.php';
require_once '_response.php';
require_once '_db.php';

// Validasi method
validateMethod(['GET']);

try {
    // Test koneksi database
    $db = getDB();
    $db->query("SELECT 1");
    
    $data = [
        'status' => 'UP',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'database' => 'connected'
    ];
    
    sendSuccess($data);
    
} catch (Exception $e) {
    $data = [
        'status' => 'DOWN',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'database' => 'disconnected',
        'error' => $e->getMessage()
    ];
    
    http_response_code(503);
    sendResponse(false, $data, 'Service unavailable');
}