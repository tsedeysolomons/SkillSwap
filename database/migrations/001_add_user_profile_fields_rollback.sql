-- Rollback Migration: 001_add_user_profile_fields
-- Description: Remove gender, role, and age_range fields from users table
-- Created: 2024-12-05
-- Author: SkillSwap Team

-- ============================================
-- DOWN Migration (Rollback Changes)
-- ============================================

BEGIN;

-- Drop indexes first
DROP INDEX IF EXISTS idx_users_role_age;
DROP INDEX IF EXISTS idx_users_age_range;
DROP INDEX IF EXISTS idx_users_role;

-- Remove columns (this will delete all data in these columns)
-- WARNING: This action cannot be undone without a backup!
ALTER TABLE users DROP COLUMN IF EXISTS age_range;
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS gender;

COMMIT;

-- ============================================
-- Verification
-- ============================================
-- Run this to verify the rollback:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('gender', 'role', 'age_range');
-- 
-- Should return 0 rows if rollback was successful
