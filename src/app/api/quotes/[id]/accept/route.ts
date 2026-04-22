import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;
  try {
    const { id } = await params;
    const pool = getPool();
    const result = await pool.query(
      `UPDATE quotes SET status = 'accepted', accepted_at = NOW() WHERE id = $1 AND buyer_id = $2 AND status = 'pending' RETURNING *`,
      [id, auth.user.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quote not found or already processed' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error accepting quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
