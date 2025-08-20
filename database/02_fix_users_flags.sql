-- ===================================================================
-- ARNVERSE Database Migration: Fix User Flags
-- File: 02_fix_users_flags.sql
-- 
-- TUJUAN: Menambahkan kolom is_active yang diperlukan oleh API login
-- PETUNJUK IMPORT:
-- 1. Import file ini SETELAH 00_schema.sql dan 01_seed.sql
-- 2. File ini idempotent (aman dijalankan berulang)
-- 3. Tidak menggunakan CREATE DATABASE atau USE
-- ===================================================================

-- Simpan setting FK dan nonaktifkan sementara
SET @OLD_FK_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Mulai transaksi
START TRANSACTION;

-- Tambahkan kolom yang hilang ke tabel users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_admin,
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL AFTER is_active;

-- Tambahkan kolom is_active ke posts dan stories jika belum ada
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_pinned;

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER is_exclusive;

-- Update data yang sudah ada
UPDATE users SET is_active = 1 WHERE is_active IS NULL OR is_active = 0;
UPDATE posts SET is_active = 1 WHERE is_active IS NULL OR is_active = 0;
UPDATE stories SET is_active = 1 WHERE is_active IS NULL OR is_active = 0;

-- Tambahkan index untuk performa
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_is_active (is_active);
ALTER TABLE posts ADD INDEX IF NOT EXISTS idx_is_active (is_active);
ALTER TABLE stories ADD INDEX IF NOT EXISTS idx_is_active (is_active);

-- Commit transaksi
COMMIT;

-- Kembalikan setting FK
SET FOREIGN_KEY_CHECKS = @OLD_FK_CHECKS;

-- Record migrasi ini
INSERT IGNORE INTO migrations (migration, batch) VALUES
('002_add_users_is_active_column', 2);