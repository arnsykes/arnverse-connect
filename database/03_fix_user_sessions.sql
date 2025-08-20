-- ===================================================================
-- ARNVERSE Database Migration: Fix User Sessions for Token Hashing
-- File: 03_fix_user_sessions.sql
-- 
-- TUJUAN: Migrasi user_sessions dari token ke token_hash untuk keamanan
-- PETUNJUK IMPORT:
-- 1. Import file ini SETELAH 00_schema.sql, 01_seed.sql, 02_fix_users_flags.sql
-- 2. File ini idempotent (aman dijalankan berulang)
-- 3. Tidak menggunakan CREATE DATABASE atau USE
-- ===================================================================

-- Simpan setting FK dan nonaktifkan sementara
SET @OLD_FK_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Mulai transaksi
START TRANSACTION;

-- Backup data lama jika ada
CREATE TABLE IF NOT EXISTS user_sessions_backup AS 
SELECT * FROM user_sessions WHERE 1=0;

-- Cek apakah kolom lama masih ada dan migrasi jika perlu
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'user_sessions' 
AND COLUMN_NAME = 'token';

-- Jika kolom 'token' ada, migrasi ke 'token_hash'
SET @sql = CASE 
  WHEN @column_exists > 0 THEN 
    'ALTER TABLE user_sessions 
     ADD COLUMN IF NOT EXISTS token_hash CHAR(64) NULL AFTER id,
     ADD COLUMN IF NOT EXISTS expires_at DATETIME NULL AFTER token_hash,
     CHANGE COLUMN ip_address ip VARCHAR(45) NULL,
     CHANGE COLUMN expired_at expires_at_old DATETIME NULL'
  ELSE 
    'SELECT "token column not found, skipping migration" as message'
END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update token_hash dari token yang ada jika diperlukan
UPDATE user_sessions 
SET token_hash = SHA2(token, 256),
    expires_at = IFNULL(expired_at, DATE_ADD(NOW(), INTERVAL 7 DAY))
WHERE token_hash IS NULL AND token IS NOT NULL;

-- Hapus kolom lama setelah migrasi
SET @drop_sql = CASE 
  WHEN @column_exists > 0 THEN 
    'ALTER TABLE user_sessions 
     DROP COLUMN IF EXISTS token,
     DROP COLUMN IF EXISTS expires_at_old,
     DROP COLUMN IF EXISTS last_used_at'
  ELSE 
    'SELECT "no old columns to drop" as message'
END;

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Pastikan indexes sesuai
ALTER TABLE user_sessions 
ADD UNIQUE INDEX IF NOT EXISTS idx_token_hash (token_hash),
ADD INDEX IF NOT EXISTS idx_user_expires (user_id, expires_at);

-- Drop index lama jika ada
ALTER TABLE user_sessions DROP INDEX IF EXISTS idx_token;
ALTER TABLE user_sessions DROP INDEX IF EXISTS idx_expired_at;

-- Pastikan constraint NOT NULL untuk kolom penting
ALTER TABLE user_sessions 
MODIFY COLUMN token_hash CHAR(64) NOT NULL,
MODIFY COLUMN expires_at DATETIME NOT NULL;

-- Commit transaksi
COMMIT;

-- Kembalikan setting FK
SET FOREIGN_KEY_CHECKS = @OLD_FK_CHECKS;

-- Record migrasi ini
INSERT IGNORE INTO migrations (migration, batch) VALUES
('003_fix_user_sessions_token_hash', 3);

-- Cleanup expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();