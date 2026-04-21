#!/usr/bin/env node

/**
 * Database Migration Script
 * This script creates the database schema and seeds initial data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('🔨 Creating database schema...');
    await pool.query(schema);
    console.log('✅ Database schema created successfully!\n');

    // Read seed file
    console.log('📄 Reading seed data file...');
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    console.log('✅ Seed data file loaded\n');

    // Execute seed data
    console.log('🌱 Seeding database with initial data...');
    await pool.query(seedData);
    console.log('✅ Database seeded successfully!\n');

    // Verify data
    console.log('🔍 Verifying migration...');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Products: ${productCount.rows[0].count}`);
    console.log('✅ Migration verified!\n');

    console.log('🎉 Database migration completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Admin: admin@smartsupply.co.ke / password');
    console.log('   Buyer: buyer@example.com / password');
    console.log('\n⚠️  Remember to change these passwords in production!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();
