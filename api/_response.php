<?php
/**
 * Response Helper untuk ARNVERSE API
 * Standarisasi format response JSON
 */

/**
 * Kirim response JSON dengan format standar
 * 
 * @param bool $success
 * @param mixed $data
 * @param string $error
 * @param array $meta
 */
function sendResponse($success, $data = null, $error = null, $meta = null) {
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        'ok' => $success,
        'data' => $data,
        'error' => $error
    ];
    
    if ($meta) {
        $response['meta'] = $meta;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

/**
 * Response sukses
 */
function sendSuccess($data = null, $meta = null) {
    sendResponse(true, $data, null, $meta);
}

/**
 * Response error
 */
function sendError($message, $httpCode = 400) {
    http_response_code($httpCode);
    sendResponse(false, null, $message);
}

/**
 * Response untuk data tidak ditemukan
 */
function sendNotFound($message = 'Data tidak ditemukan') {
    sendError($message, 404);
}

/**
 * Response untuk unauthorized
 */
function sendUnauthorized($message = 'Tidak memiliki akses') {
    sendError($message, 401);
}

/**
 * Response untuk validation error
 */
function sendValidationError($message = 'Data tidak valid') {
    sendError($message, 422);
}

/**
 * Response untuk server error
 */
function sendServerError($message = 'Terjadi kesalahan server') {
    sendError($message, 500);
}

/**
 * Handle exception dan kirim response error
 */
function handleException($e) {
    error_log("API Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    sendServerError('Terjadi kesalahan internal');
}

/**
 * Set CORS headers jika diperlukan
 */
function setCorsHeaders() {
    // Karena frontend dan backend di domain yang sama, CORS tidak diperlukan
    // Tapi bisa diaktifkan jika diperlukan untuk testing
    /*
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    */
}

/**
 * Validasi method HTTP
 */
function validateMethod($allowedMethods) {
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, $allowedMethods)) {
        http_response_code(405);
        sendError('Method tidak diizinkan');
        exit;
    }
}

/**
 * Get pagination metadata
 */
function getPaginationMeta($page, $limit, $total) {
    $totalPages = ceil($total / $limit);
    
    return [
        'page' => (int)$page,
        'limit' => (int)$limit,
        'total' => (int)$total,
        'total_pages' => (int)$totalPages,
        'has_next' => $page < $totalPages,
        'has_prev' => $page > 1
    ];
}