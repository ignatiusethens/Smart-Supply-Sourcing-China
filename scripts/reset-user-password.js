#!/usr/bin/env node

/**
 * Manual Password Reset Script
 * This script allows you to manually reset a user's password
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetUserPassword(email, newPassword) {
  console.log('🔐 Manual Password Reset...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!\n');

    // Check if user exists
    console.log(`🔍 Looking for user: ${email}`);
    const userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.name} (${user.role})\n`);

    // Generate bcrypt hash
    console.log('🔨 Generating password hash...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updateResult = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, user.id]
    );

    if (updateResult.rowCount > 0) {
      console.log('✅ Password updated successfully!\n');
      console.log('📝 Updated Login Credentials:');
      console.log(
        '┌─────────────────────────────────────────────────────────┐'
      );
      console.log(
        '│                    LOGIN CREDENTIALS                    │'
      );
      console.log(
        '├─────────────────────────────────────────────────────────┤'
      );
      console.log(`│ Email:    ${email.padEnd(43)} │`);
      console.log(`│ Password: ${newPassword.padEnd(43)} │`);
      console.log(`│ Role:     ${user.role.padEnd(43)} │`);
      console.log(
        '└─────────────────────────────────────────────────────────┘'
      );
      console.log('\n⚠️  IMPORTANT: Change this password after logging in!\n');
    } else {
      console.log('❌ Failed to update password');
    }
  } catch (error) {
    console.error('❌ Password reset failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const newPassword = args[1];

if (!email || !newPassword) {
  console.log(
    'Usage: node scripts/reset-user-password.js <email> <new-password>'
  );
  console.log(
    'Example: node scripts/reset-user-password.js ignatiusethens@gmail.com newpassword123'
  );
  process.exit(1);
}

// Run password reset
resetUserPassword(email, newPassword);
