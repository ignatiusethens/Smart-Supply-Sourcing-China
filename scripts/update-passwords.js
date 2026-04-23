#!/usr/bin/env node

/**
 * Password Update Script
 * This script updates user passwords with proper bcrypt hashes
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function updatePasswords() {
  console.log('🔐 Updating user passwords...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Define users with their passwords
    const users = [
      {
        email: 'smartsupplysourcing@gmail.com',
        password: 'admin123',
        role: 'Admin',
      },
      {
        email: 'buyer@example.com',
        password: 'buyer123',
        role: 'Buyer',
      },
      {
        email: 'mary@manufacturing.co.ke',
        password: 'mary123',
        role: 'Buyer',
      },
    ];

    console.log('🔨 Generating password hashes and updating database...\n');

    for (const user of users) {
      // Generate bcrypt hash
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(user.password, saltRounds);

      // Update database
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, user.email]
      );

      if (result.rowCount > 0) {
        console.log(`✅ Updated password for ${user.role}: ${user.email}`);
        console.log(`   Password: ${user.password}`);
      } else {
        console.log(`❌ User not found: ${user.email}`);
      }
    }

    console.log('\n🎉 Password update completed successfully!\n');
    console.log('📝 Updated Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    LOGIN CREDENTIALS                    │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ ADMIN ACCOUNT                                           │');
    console.log('│ Email:    admin@smartsupply.co.ke                       │');
    console.log('│ Password: admin123                                      │');
    console.log('│                                                         │');
    console.log('│ BUYER ACCOUNTS                                          │');
    console.log('│ Email:    buyer@example.com                             │');
    console.log('│ Password: buyer123                                      │');
    console.log('│                                                         │');
    console.log('│ Email:    mary@manufacturing.co.ke                      │');
    console.log('│ Password: mary123                                       │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n⚠️  IMPORTANT: Change these passwords in production!\n');
  } catch (error) {
    console.error('❌ Password update failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run password update
updatePasswords();
