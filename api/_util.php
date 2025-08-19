<?php
/**
 * Utility Functions untuk ARNVERSE API
 */

require_once '_env.php';

/**
 * Validasi email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize string input
 */
function sanitizeString($input, $maxLength = null) {
    $clean = trim(strip_tags($input));
    if ($maxLength && strlen($clean) > $maxLength) {
        $clean = substr($clean, 0, $maxLength);
    }
    return $clean;
}

/**
 * Validasi panjang string
 */
function validateLength($string, $min = 1, $max = null) {
    $length = strlen($string);
    if ($length < $min) return false;
    if ($max && $length > $max) return false;
    return true;
}

/**
 * Get pagination parameters
 */
function getPaginationParams() {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(MAX_PAGE_SIZE, max(1, (int)($_GET['limit'] ?? DEFAULT_PAGE_SIZE)));
    $offset = ($page - 1) * $limit;
    
    return [$page, $limit, $offset];
}

/**
 * Extract hashtags dari text
 */
function extractHashtags($text) {
    preg_match_all('/#([a-zA-Z0-9_\u00c0-\u024f\u1e00-\u1eff]+)/u', $text, $matches);
    return array_unique(array_map('strtolower', $matches[1]));
}

/**
 * Extract mentions dari text
 */
function extractMentions($text) {
    preg_match_all('/@([a-zA-Z0-9_]+)/', $text, $matches);
    return array_unique($matches[1]);
}

/**
 * Generate unique filename untuk upload
 */
function generateUniqueFilename($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    return $filename;
}

/**
 * Validasi file upload
 */
function validateUploadedFile($file, $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']) {
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return ['valid' => false, 'error' => 'File tidak valid'];
    }
    
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        return ['valid' => false, 'error' => 'Ukuran file terlalu besar'];
    }
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return ['valid' => false, 'error' => 'Tipe file tidak diizinkan'];
    }
    
    return ['valid' => true, 'mime_type' => $mimeType];
}

/**
 * Handle file upload
 */
function handleFileUpload($file, $subfolder = '') {
    $validation = validateUploadedFile($file);
    if (!$validation['valid']) {
        throw new Exception($validation['error']);
    }
    
    $uploadDir = UPLOAD_PATH . $subfolder;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = generateUniqueFilename($file['name']);
    $filepath = $uploadDir . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Gagal menyimpan file');
    }
    
    return [
        'filename' => $filename,
        'filepath' => $filepath,
        'url' => UPLOADS_URL . '/' . $subfolder . '/' . $filename,
        'mime_type' => $validation['mime_type'],
        'size' => $file['size']
    ];
}

/**
 * Format user data untuk response
 */
function formatUserData($user, $includeSensitive = false) {
    $formatted = [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'display_name' => $user['display_name'],
        'bio' => $user['bio'],
        'avatar' => $user['avatar'] ? UPLOADS_URL . '/avatars/' . $user['avatar'] : null,
        'is_verified' => (bool)$user['is_verified'],
        'created_at' => $user['created_at']
    ];
    
    if ($includeSensitive) {
        $formatted['email'] = $user['email'];
        $formatted['is_admin'] = (bool)$user['is_admin'];
    }
    
    return $formatted;
}

/**
 * Format post data untuk response
 */
function formatPostData($post, $currentUserId = null) {
    return [
        'id' => (int)$post['id'],
        'content' => $post['content'],
        'media_urls' => $post['media_urls'] ? json_decode($post['media_urls'], true) : [],
        'hashtags' => $post['hashtags'] ? explode(',', $post['hashtags']) : [],
        'likes_count' => (int)$post['likes_count'],
        'comments_count' => (int)$post['comments_count'],
        'shares_count' => (int)$post['shares_count'],
        'views_count' => (int)$post['views_count'],
        'is_liked' => $currentUserId ? (bool)($post['is_liked'] ?? false) : false,
        'is_saved' => $currentUserId ? (bool)($post['is_saved'] ?? false) : false,
        'created_at' => $post['created_at'],
        'updated_at' => $post['updated_at'],
        'author' => [
            'id' => (int)$post['author_id'],
            'username' => $post['author_username'],
            'display_name' => $post['author_display_name'],
            'avatar' => $post['author_avatar'] ? UPLOADS_URL . '/avatars/' . $post['author_avatar'] : null,
            'is_verified' => (bool)$post['author_is_verified']
        ]
    ];
}

/**
 * Rate limiting sederhana
 */
function checkRateLimit($userId, $action, $maxAttempts = 5, $timeWindow = 300) {
    // Implementasi sederhana menggunakan file atau database
    // Untuk production, gunakan Redis atau database
    $key = "rate_limit_{$action}_{$userId}";
    $file = sys_get_temp_dir() . "/{$key}";
    
    $attempts = 0;
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if ($data && $data['timestamp'] > time() - $timeWindow) {
            $attempts = $data['attempts'];
        }
    }
    
    if ($attempts >= $maxAttempts) {
        return false;
    }
    
    // Update attempts
    file_put_contents($file, json_encode([
        'attempts' => $attempts + 1,
        'timestamp' => time()
    ]));
    
    return true;
}

/**
 * Generate slug dari text
 */
function generateSlug($text) {
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Time ago helper
 */
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'baru saja';
    if ($time < 3600) return floor($time/60) . 'm';
    if ($time < 86400) return floor($time/3600) . 'h';
    if ($time < 2592000) return floor($time/86400) . 'd';
    if ($time < 31536000) return floor($time/2592000) . 'mo';
    
    return floor($time/31536000) . 'y';
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, 
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Get user agent
 */
function getUserAgent() {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
}