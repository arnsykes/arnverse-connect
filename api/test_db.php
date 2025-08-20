<?php
/**
 * Database Connection Test untuk ARNVERSE
 * File untuk testing koneksi database di cPanel
 * 
 * CARA PAKAI:
 * 1. Upload file ini ke /api/test_db.php
 * 2. Akses https://arnworld.space/api/test_db.php
 * 3. Lihat hasil koneksi dan struktur tabel users
 * 4. HAPUS file ini setelah testing (jangan biarkan di production)
 */

// Tampilkan error untuk debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '_env.php';

echo "<h2>🧪 ARNVERSE Database Connection Test</h2>";

try {
    // Test koneksi database
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    echo "<p>✅ <strong>Database Connection:</strong> SUCCESS</p>";
    echo "<p>📊 <strong>Database Name:</strong> " . DB_NAME . "</p>";
    echo "<p>👤 <strong>Database User:</strong> " . DB_USER . "</p>";
    
    // Test struktur tabel users
    echo "<h3>📋 Tabel Users Structure:</h3>";
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll();
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Check kolom is_active
    $hasIsActive = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'is_active') {
            $hasIsActive = true;
            break;
        }
    }
    
    if ($hasIsActive) {
        echo "<p>✅ <strong>Kolom is_active:</strong> FOUND</p>";
    } else {
        echo "<p>❌ <strong>Kolom is_active:</strong> MISSING - Import database/02_fix_users_flags.sql!</p>";
    }
    
    // Test count data
    echo "<h3>📊 Data Count:</h3>";
    $counts = [
        'users' => $pdo->query("SELECT COUNT(*) as count FROM users")->fetch()['count'],
        'posts' => $pdo->query("SELECT COUNT(*) as count FROM posts")->fetch()['count'],
        'hashtags' => $pdo->query("SELECT COUNT(*) as count FROM hashtags")->fetch()['count'],
        'likes' => $pdo->query("SELECT COUNT(*) as count FROM likes")->fetch()['count'],
    ];
    
    foreach ($counts as $table => $count) {
        echo "<p>📈 <strong>$table:</strong> $count records</p>";
    }
    
    // Test user demo alice
    echo "<h3>👤 User Demo Test:</h3>";
    $stmt = $pdo->prepare("SELECT id, username, email, display_name, is_verified, is_admin, is_active FROM users WHERE email = ?");
    $stmt->execute(['alice@arnverse.com']);
    $alice = $stmt->fetch();
    
    if ($alice) {
        echo "<p>✅ <strong>User alice@arnverse.com:</strong> FOUND</p>";
        echo "<pre>" . print_r($alice, true) . "</pre>";
        
        // Test password verification
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE email = ?");
        $stmt->execute(['alice@arnverse.com']);
        $user = $stmt->fetch();
        
        if (password_verify('password', $user['password_hash'])) {
            echo "<p>✅ <strong>Password Test:</strong> SUCCESS - 'password' hash valid</p>";
        } else {
            echo "<p>❌ <strong>Password Test:</strong> FAILED - hash tidak cocok</p>";
        }
    } else {
        echo "<p>❌ <strong>User alice@arnverse.com:</strong> NOT FOUND - Import seed data!</p>";
    }
    
    echo "<hr>";
    echo "<h3>🚀 Next Steps:</h3>";
    echo "<ol>";
    echo "<li>Jika semua test ✅, lanjut test API login</li>";
    echo "<li>Jika ada ❌, perbaiki sesuai instruksi di atas</li>";
    echo "<li><strong>HAPUS file ini setelah testing selesai!</strong></li>";
    echo "</ol>";
    
} catch (PDOException $e) {
    echo "<p>❌ <strong>Database Connection:</strong> FAILED</p>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Solusi:</strong></p>";
    echo "<ul>";
    echo "<li>Cek kredensial database di .env</li>";
    echo "<li>Pastikan database sudah dibuat di cPanel</li>";
    echo "<li>Pastikan user database punya akses ke database</li>";
    echo "</ul>";
} catch (Exception $e) {
    echo "<p>❌ <strong>General Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><small>⚠️ <strong>WARNING:</strong> Hapus file ini setelah testing selesai untuk keamanan!</small></p>";
?>