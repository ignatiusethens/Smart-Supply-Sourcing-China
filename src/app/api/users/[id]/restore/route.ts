import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id: userId } = await params;
    const pool = getPool();

    // Check if user exists
    const userCheck = await pool.query('SELECT id, status FROM users WHERE id = $1', [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user status to verified
    await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
      ['verified', userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User restored successfully',
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to restore user',
      },
      { status: 500 }
    );
  }
}
