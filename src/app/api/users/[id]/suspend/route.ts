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
    const userCheck = await pool.query('SELECT id, role, status FROM users WHERE id = $1', [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent suspending admin users
    if (userCheck.rows[0].role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot suspend admin users' },
        { status: 400 }
      );
    }

    // Update user status to suspended
    await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
      ['suspended', userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to suspend user',
      },
      { status: 500 }
    );
  }
}
