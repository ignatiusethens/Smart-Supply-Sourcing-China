import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;
  try {
    const { id } = await params;
    const pool = getPool();
    const result = await pool.query(
      `SELECT q.*, json_agg(json_build_object('id', qli.id, 'description', qli.description, 'quantity', qli.quantity, 'unitPrice', qli.unit_price, 'subtotal', qli.subtotal)) as line_items
       FROM quotes q LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
       WHERE q.id = $1 GROUP BY q.id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }
    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        sourcingRequestId: row.sourcing_request_id,
        buyerId: row.buyer_id,
        totalAmount: parseFloat(row.total_amount),
        validUntil: row.valid_until,
        status: row.status,
        lineItems: row.line_items || [],
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
