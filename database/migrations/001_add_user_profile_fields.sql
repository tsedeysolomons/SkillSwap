-- Migration: 001_add_user_profile_fields
-- Description: Add gender, role, and age_range fields to users table
-- Created: 2024-12-05
-- Author: SkillSwap Team

-- ============================================
-- UP Migration (Apply Changes)
-- ============================================

BEGIN;

-- Add gender column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(50) 
CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say'));

-- Add role column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) 
CHECK (role IN ('teacher', 'student', 'both'));

-- Add age_range column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age_range VARCHAR(20) 
CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+'));

-- Add comments for documentation
COMMENT ON COLUMN users.gender IS 'User gender identity (male, female, other, prefer-not-to-say)';
COMMENT ON COLUMN users.role IS 'User role on platform (teacher, student, both)';
COMMENT ON COLUMN users.age_range IS 'User age bracket for matching (18-24, 25-34, 35-44, 45-54, 55+)';

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index for age range queries
CREATE INDEX IF NOT EXISTS idx_users_age_range ON users(age_range);

-- Create composite index for role + age queries
CREATE INDEX IF NOT EXISTS idx_users_role_age ON users(role, age_range);

COMMIT;

-- ============================================
-- Verification
-- ============================================
-- Run this to verify the migration:
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('gender', 'role', 'age_range');
