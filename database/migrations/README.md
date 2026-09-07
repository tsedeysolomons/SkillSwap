# Database Migrations

This directory contains all database schema migrations for SkillSwap.

## 📁 Structure

```
migrations/
├── README.md                                    # This file
├── run-migration.js                             # Migration runner script
├── 001_add_user_profile_fields.sql             # Migration 001 (UP)
├── 001_add_user_profile_fields_rollback.sql    # Migration 001 (DOWN)
└── ...                                          # Future migrations
```

## 🚀 Quick Start

### Prerequisites
- PostgreSQL database running
- `.env` file configured in backend directory
- Node.js installed

### Run Your First Migration

```bash
cd database/migrations
node run-migration.js up 001
```

## 📋 Available Migrations

### 001 - Add User Profile Fields
**Status:** Ready to apply  
**Description:** Adds `gender`, `role`, and `age_range` fields to users table

**What it does:**
- Adds `gender` column (male, female, other, prefer-not-to-say)
- Adds `role` column (teacher, student, both)
- Adds `age_range` column (18-24, 25-34, 35-44, 45-54, 55+)
- Creates indexes for performance
- Adds CHECK constraints for data validation

**Apply:**
```bash
node run-migration.js up 001
```

**Rollback:**
```bash
node run-migration.js down 001
```

---

## 🛠️ Commands

### Apply Migration
```bash
node run-migration.js up <migration_number>
```
Example: `node run-migration.js up 001`

### Rollback Migration
```bash
node run-migration.js down <migration_number>
```
Example: `node run-migration.js down 001`

⚠️ **WARNING:** Rollback will delete all data in the affected columns!

### Check Status
```bash
node run-migration.js status
```

Shows all migrations and their current state:
- ✓ Applied - Migration is active
- ✗ Rolled back - Migration was reversed

---

## 📊 Migration Tracking

Migrations are tracked in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW(),
    rollback_at TIMESTAMP
);
```

---

## ✍️ Creating New Migrations

### Step 1: Create Migration File
```bash
# Create new migration (UP)
touch 002_your_migration_name.sql

# Create rollback (DOWN)
touch 002_your_migration_name_rollback.sql
```

### Step 2: Write Migration SQL

**002_your_migration_name.sql:**
```sql
-- Migration: 002_your_migration_name
-- Description: Brief description
-- Created: YYYY-MM-DD

BEGIN;

-- Your SQL changes here
ALTER TABLE your_table ADD COLUMN new_field VARCHAR(50);

COMMIT;
```

**002_your_migration_name_rollback.sql:**
```sql
-- Rollback Migration: 002_your_migration_name

BEGIN;

-- Reverse your changes
ALTER TABLE your_table DROP COLUMN new_field;

COMMIT;
```

### Step 3: Update run-migration.js
Add your migration to the available migrations list in the help text.

### Step 4: Test Migration
```bash
# Apply
node run-migration.js up 002

# Verify
psql $DATABASE_URL -c "SELECT * FROM your_table LIMIT 1;"

# Rollback (if needed)
node run-migration.js down 002
```

---

## 📝 Best Practices

### DO ✅
- Always write both UP and DOWN migrations
- Test migrations on a development database first
- Use transactions (BEGIN/COMMIT)
- Add comments explaining why changes are made
- Create indexes for frequently queried columns
- Use `IF NOT EXISTS` for safety
- Back up production database before applying

### DON'T ❌
- Don't modify existing migration files after they're applied
- Don't delete data without confirmation
- Don't run migrations directly in production without testing
- Don't skip migration numbers
- Don't forget to add CHECK constraints for enums

---

## 🔍 Troubleshooting

### Migration Already Applied
**Error:** "Migration XXX is already applied"  
**Solution:** Check status with `node run-migration.js status`

### Connection Failed
**Error:** "Failed to connect to database"  
**Solution:** 
1. Check `.env` file has correct DATABASE_URL
2. Ensure PostgreSQL is running
3. Verify database credentials

### Migration Failed Mid-Way
**Error:** Migration partially applied  
**Solution:**
1. Check `schema_migrations` table for status
2. Manually rollback partial changes if needed
3. Fix the SQL and try again

### Rollback Loses Data
**Prevention:** Always backup before rolling back!
```bash
# Backup before rollback
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Then rollback
node run-migration.js down 001
```

---

## 🎯 Example Workflow

### Development
```bash
# 1. Create new migration
touch 002_add_user_skills.sql
touch 002_add_user_skills_rollback.sql

# 2. Write migration SQL
# ... edit files ...

# 3. Test on dev database
node run-migration.js up 002

# 4. Verify changes
node run-migration.js status

# 5. Test rollback
node run-migration.js down 002

# 6. Re-apply for commit
node run-migration.js up 002
```

### Production
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_prod_$(date +%Y%m%d).sql

# 2. Check current status
node run-migration.js status

# 3. Apply migration
node run-migration.js up 002

# 4. Verify application still works
# ... test your app ...

# 5. If issues, rollback
node run-migration.js down 002

# 6. Restore backup if needed
psql $DATABASE_URL < backup_prod_$(date +%Y%m%d).sql
```

---

## 📞 Support

If you encounter issues:
1. Check this README
2. Review error messages carefully
3. Check PostgreSQL logs
4. Verify `.env` configuration
5. Create an issue with error details

---

## 📚 Additional Resources

- [PostgreSQL ALTER TABLE docs](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [SkillSwap Database Schema](../schema.sql)

---

**Last Updated:** 2024-12-05  
**Maintained by:** SkillSwap Team
