<?php
/**
 * Profile Endpoint
 * GET /api/profile.php - Get user profile
 * POST /api/profile.php - Update profile
 */

require_once '_env.php';
require_once '_db.php';
require_once '_auth.php';
require_once '_response.php';
require_once '_util.php';

// Validasi method
validateMethod(['GET', 'POST']);

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        // GET: Get user profile (own or other user's)
        
        // Optional authentication untuk public profiles
        $currentUser = null;
        $token = Auth::getBearerToken();
        if ($token) {
            $payload = Auth::validateJWT($token);
            if ($payload && Auth::isSessionValid($token, $payload['uid'])) {
                $currentUser = Auth::getUserById($payload['uid']);
            }
        }
        
        $currentUserId = $currentUser ? $currentUser['id'] : null;
        
        // Get target user (username dari query param, atau current user jika login)
        $username = sanitizeString($_GET['username'] ?? '');
        
        $db = getDB();
        
        if ($username) {
            // Get specific user profile
            $targetUser = $db->fetch(
                "SELECT id, username, email, display_name, bio, avatar, is_verified, is_admin, created_at 
                 FROM users WHERE username = ? AND is_active = 1",
                [$username]
            );
        } else if ($currentUserId) {
            // Get current user profile
            $targetUser = $currentUser;
        } else {
            sendValidationError('Username parameter atau authentication diperlukan');
            exit;
        }
        
        if (!$targetUser) {
            sendNotFound('User tidak ditemukan');
            exit;
        }
        
        $targetUserId = $targetUser['id'];
        $isOwnProfile = $currentUserId && $currentUserId == $targetUserId;
        
        // Get user stats
        $stats = $db->fetch("
            SELECT 
                (SELECT COUNT(*) FROM posts WHERE user_id = ? AND is_active = 1) as posts_count,
                (SELECT COUNT(*) FROM follows WHERE following_id = ?) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count
        ", [$targetUserId, $targetUserId, $targetUserId]);
        
        // Check if current user follows target user
        $isFollowing = false;
        if ($currentUserId && $currentUserId != $targetUserId) {
            $followCheck = $db->fetch(
                "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?",
                [$currentUserId, $targetUserId]
            );
            $isFollowing = $followCheck !== false;
        }
        
        // Format user data
        $userData = formatUserData($targetUser, $isOwnProfile);
        $userData['stats'] = [
            'posts_count' => (int)$stats['posts_count'],
            'followers_count' => (int)$stats['followers_count'],
            'following_count' => (int)$stats['following_count']
        ];
        $userData['is_following'] = $isFollowing;
        $userData['is_own_profile'] = $isOwnProfile;
        
        sendSuccess($userData);
        
    } else if ($method === 'POST') {
        // POST: Update profile
        
        // Require authentication
        $user = require_auth();
        $userId = $user['id'];
        
        // Rate limiting
        if (!checkRateLimit($userId, 'update_profile', 5, 3600)) {
            sendError('Terlalu banyak update profil dalam 1 jam terakhir', 429);
            exit;
        }
        
        $db = getDB();
        $db->beginTransaction();
        
        $updates = [];
        $params = [];
        
        // Handle text fields
        if (isset($_POST['display_name'])) {
            $displayName = sanitizeString($_POST['display_name'], 100);
            if (!validateLength($displayName, 1, 100)) {
                sendValidationError('Display name harus 1-100 karakter');
                exit;
            }
            $updates[] = "display_name = ?";
            $params[] = $displayName;
        }
        
        if (isset($_POST['bio'])) {
            $bio = sanitizeString($_POST['bio'], 500);
            if (strlen($bio) > 500) {
                sendValidationError('Bio maksimal 500 karakter');
                exit;
            }
            $updates[] = "bio = ?";
            $params[] = $bio;
        }
        
        // Handle avatar upload
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            $upload = handleFileUpload($_FILES['avatar'], 'avatars');
            
            // Delete old avatar if exists
            if ($user['avatar']) {
                $oldAvatarPath = UPLOAD_PATH . 'avatars/' . $user['avatar'];
                if (file_exists($oldAvatarPath)) {
                    unlink($oldAvatarPath);
                }
            }
            
            $updates[] = "avatar = ?";
            $params[] = $upload['filename'];
        }
        
        if (empty($updates)) {
            sendValidationError('Tidak ada data untuk diupdate');
            exit;
        }
        
        // Update user data
        $updates[] = "updated_at = NOW()";
        $params[] = $userId;
        
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        $db->execute($sql, $params);
        
        $db->commit();
        
        // Get updated user data
        $updatedUser = Auth::getUserById($userId);
        $userData = formatUserData($updatedUser, true);
        
        sendSuccess($userData);
    }
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    handleException($e);
}