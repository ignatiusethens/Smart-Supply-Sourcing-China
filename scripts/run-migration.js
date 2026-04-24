#!/usr/bin/env node

/**
 * Run a specific migration file
 * Usage: node scripts/run-migration.js <migration-file-name>
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration(migrationFile) {
  console.log(`🚀 Running migration: ${migrationFile}\n`);

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Read migration file
    console.log('📄 Reading migration file...');
    const migrationPath = path.join(__dirname, '../database/migrations', migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migration = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded\n');

    // Execute migration
    console.log('🔨 Executing migration...');
    await pool.query(migration);
    console.log('✅ Migration executed successfully!\n');

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file name');
  console.error('Usage: node scripts/run-migration.js <migration-file-name>');
  process.exit(1);
}

// Run migration
runMigration(migrationFile);
