import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const pool = getPool();

    // Fetch all users with their order counts
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.phone,
        u.company_name,
        u.role,
        u.status,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT o.id) as order_count
      FROM users u
      LEFT JOIN orders o ON u.id = o.buyer_id
      GROUP BY u.id, u.email, u.name, u.phone, u.company_name, u.role, u.status, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
      `
    );

    // Transform the data
    const users = result.rows.map((user: {
      id: string;
      email: string;
      name: string;
      phone?: string;
      company_name?: string;
      role: string;
      created_at: string;
      updated_at: string;
      order_count: string;
      status?: string;
    }) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      companyName: user.company_name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      orderCount: parseInt(user.order_count) || 0,
      status: user.status || 'verified',
    }));

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
