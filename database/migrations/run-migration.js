#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Usage:
 *   node run-migration.js up 001    - Apply migration 001
 *   node run-migration.js down 001  - Rollback migration 001
 *   node run-migration.js status    - Show migration status
 */

require('dotenv').config({ path: '../../backend/.env' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW(),
      rollback_at TIMESTAMP
    );
  `;
  
  try {
    await client.query(query);
    log('✓ Migrations table ready', 'green');
  } catch (error) {
    log(`✗ Failed to create migrations table: ${error.message}`, 'red');
    throw error;
  }
}

async function getMigrationStatus() {
  const query = `
    SELECT migration_name, applied_at, rollback_at 
    FROM schema_migrations 
    ORDER BY migration_name;
  `;
  
  try {
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    log(`✗ Failed to get migration status: ${error.message}`, 'red');
    return [];
  }
}

async function isMigrationApplied(migrationName) {
  const query = `
    SELECT COUNT(*) as count 
    FROM schema_migrations 
    WHERE migration_name = $1 AND rollback_at IS NULL;
  `;
  
  const result = await client.query(query, [migrationName]);
  return parseInt(result.rows[0].count) > 0;
}

async function applyMigration(migrationNumber) {
  const migrationName = `${migrationNumber}_add_user_profile_fields`;
  const filePath = path.join(__dirname, `${migrationName}.sql`);
  
  if (!fs.existsSync(filePath)) {
    log(`✗ Migration file not found: ${filePath}`, 'red');
    return false;
  }
  
  // Check if already applied
  if (await isMigrationApplied(migrationName)) {
    log(`⚠ Migration ${migrationName} is already applied`, 'yellow');
    return false;
  }
  
  log(`\n▶ Applying migration: ${migrationName}`, 'cyan');
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Execute migration
    await client.query(sql);
    
    // Record migration
    await client.query(
      'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
      [migrationName]
    );
    
    log(`✓ Migration ${migrationName} applied successfully!`, 'green');
    return true;
  } catch (error) {
    log(`✗ Migration failed: ${error.message}`, 'red');
    log(`  ${error.stack}`, 'red');
    return false;
  }
}

async function rollbackMigration(migrationNumber) {
  const migrationName = `${migrationNumber}_add_user_profile_fields`;
  const filePath = path.join(__dirname, `${migrationName}_rollback.sql`);
  
  if (!fs.existsSync(filePath)) {
    log(`✗ Rollback file not found: ${filePath}`, 'red');
    return false;
  }
  
  // Check if migration was applied
  if (!(await isMigrationApplied(migrationName))) {
    log(`⚠ Migration ${migrationName} is not applied, nothing to rollback`, 'yellow');
    return false;
  }
  
  log(`\n▶ Rolling back migration: ${migrationName}`, 'cyan');
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Execute rollback
    await client.query(sql);
    
    // Update migration record
    await client.query(
      'UPDATE schema_migrations SET rollback_at = NOW() WHERE migration_name = $1',
      [migrationName]
    );
    
    log(`✓ Migration ${migrationName} rolled back successfully!`, 'green');
    return true;
  } catch (error) {
    log(`✗ Rollback failed: ${error.message}`, 'red');
    log(`  ${error.stack}`, 'red');
    return false;
  }
}

async function showStatus() {
  log('\n📊 Migration Status:', 'blue');
  log('═'.repeat(80), 'blue');
  
  const migrations = await getMigrationStatus();
  
  if (migrations.length === 0) {
    log('No migrations found', 'yellow');
  } else {
    migrations.forEach(m => {
      const status = m.rollback_at ? '✗ Rolled back' : '✓ Applied';
      const color = m.rollback_at ? 'red' : 'green';
      const date = m.rollback_at || m.applied_at;
      log(`${status} ${m.migration_name} (${new Date(date).toLocaleString()})`, color);
    });
  }
  
  log('═'.repeat(80), 'blue');
}

async function main() {
  const [,, command, migrationNumber] = process.argv;
  
  if (!command || !['up', 'down', 'status'].includes(command)) {
    log('\n📦 SkillSwap Database Migration Tool', 'cyan');
    log('\nUsage:', 'yellow');
    log('  node run-migration.js up 001      - Apply migration 001');
    log('  node run-migration.js down 001    - Rollback migration 001');
    log('  node run-migration.js status      - Show migration status');
    log('\nAvailable migrations:', 'yellow');
    log('  001 - Add user profile fields (gender, role, age_range)');
    process.exit(1);
  }
  
  try {
    // Connect to database
    await client.connect();
    log('✓ Connected to database', 'green');
    
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Execute command
    switch (command) {
      case 'up':
        if (!migrationNumber) {
          log('✗ Please specify migration number (e.g., 001)', 'red');
          process.exit(1);
        }
        await applyMigration(migrationNumber);
        await showStatus();
        break;
        
      case 'down':
        if (!migrationNumber) {
          log('✗ Please specify migration number (e.g., 001)', 'red');
          process.exit(1);
        }
        log('\n⚠️  WARNING: This will delete data in these columns!', 'yellow');
        await rollbackMigration(migrationNumber);
        await showStatus();
        break;
        
      case 'status':
        await showStatus();
        break;
    }
    
  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
    log('\n✓ Database connection closed', 'green');
  }
}

// Run the migration tool
main();
