import * as crypto from 'crypto';
import { getPool } from '@/lib/database/connection';

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

  const pool = getPool();
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  return token;
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT user_id, expires_at, used 
       FROM password_reset_tokens 
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return { valid: false, error: 'Invalid reset token' };
    }

    const resetToken = result.rows[0];

    if (resetToken.used) {
      return { valid: false, error: 'Reset token has already been used' };
    }

    if (new Date() > new Date(resetToken.expires_at)) {
      return { valid: false, error: 'Reset token has expired' };
    }

    return { valid: true, userId: resetToken.user_id };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { valid: false, error: 'Failed to verify reset token' };
  }
}

/**
 * Mark a reset token as used
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
    [token]
  );
}

/**
 * Clean up expired reset tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const pool = getPool();
  await pool.query(
    'DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE'
  );
}
