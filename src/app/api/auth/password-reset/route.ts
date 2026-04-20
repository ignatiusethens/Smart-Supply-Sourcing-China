import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { createPasswordResetToken, verifyResetToken, markTokenAsUsed } from '@/lib/auth/password-reset';
import { hashPassword, validatePassword } from '@/lib/auth/password';

interface PasswordResetRequestBody {
  email: string;
}

interface PasswordResetConfirmBody {
  token: string;
  newPassword: string;
}

interface PasswordResetResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * POST /api/auth/password-reset
 * Request password reset (send email with reset link)
 */
export async function POST(request: NextRequest): Promise<NextResponse<PasswordResetResponse>> {
  try {
    const body: PasswordResetRequestBody = await request.json();

    // Validate input
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check if user exists
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [body.email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists for security reasons
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a password reset link has been sent' },
        { status: 200 }
      );
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = await createPasswordResetToken(user.id);

    // In a real application, you would send an email here with the reset link
    // For now, we'll log it to the console (in development) or return it in the response
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log('Password reset link for', user.email, ':', resetLink);

    // In production, you would use an email service like SendGrid, AWS SES, etc.
    // await sendPasswordResetEmail(user.email, user.name, resetLink);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset link has been sent to your email',
        // Remove this in production - only for development/testing
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/password-reset
 * Confirm password reset with token and new password
 */
export async function PUT(request: NextRequest): Promise<NextResponse<PasswordResetResponse>> {
  try {
    const body: PasswordResetConfirmBody = await request.json();

    // Validate input
    if (!body.token || !body.newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(body.newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Verify reset token
    const tokenVerification = await verifyResetToken(body.token);
    if (!tokenVerification.valid || !tokenVerification.userId) {
      return NextResponse.json(
        { success: false, error: tokenVerification.error || 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(body.newPassword);

    const pool = getPool();

    // Update user password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, tokenVerification.userId]
    );

    // Mark token as used
    await markTokenAsUsed(body.token);

    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
