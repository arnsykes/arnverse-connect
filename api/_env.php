<?php
/**
 * Konfigurasi Environment untuk ARNVERSE API
 * File ini membaca konfigurasi dari environment variables atau menggunakan fallback
 */

// Kredensial Database
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'arnn8651_arnverse');
define('DB_USER', $_ENV['DB_USER'] ?? 'arnn8651_arnverse');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// JWT Secret Key (WAJIB diubah di production!)
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'arnverse_jwt_secret_key_2024_change_in_production');

// Base URL
define('BASE_URL', $_ENV['BASE_URL'] ?? 'https://arnworld.space');
define('API_URL', BASE_URL . '/api');
define('UPLOADS_URL', API_URL . '/uploads');

// Upload Configuration
define('UPLOAD_MAX_SIZE', 10 * 1024 * 1024); // 10MB
define('UPLOAD_PATH', __DIR__ . '/uploads/');

// JWT Configuration
define('JWT_EXPIRE_HOURS', 24 * 7); // 7 hari

// Pagination defaults
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Story configuration (dalam jam)
define('STORY_EXPIRE_HOURS', 24);

// Timezone
date_default_timezone_set('Asia/Jakarta');