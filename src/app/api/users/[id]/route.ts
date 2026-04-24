import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { requireAdmin } from '@/lib/auth/middleware';
import bcrypt from 'bcryptjs';

// GET single user
export async function GET(
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

    // Fetch user with order count
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
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.name, u.phone, u.company_name, u.role, u.status, u.created_at, u.updated_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        companyName: user.company_name,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        orderCount: parseInt(user.order_count) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
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
    const body = await request.json();
    const { name, email, phone, companyName, role, status, password } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check if user exists
    const userCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another user
    if (email !== userCheck.rows[0].email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Build update query
    let updateQuery = `
      UPDATE users 
      SET name = $1, 
          email = $2, 
          phone = $3, 
          company_name = $4, 
          role = $5, 
          status = $6,
          updated_at = NOW()
    `;
    const queryParams: (string | null)[] = [
      name,
      email,
      phone || null,
      companyName || null,
      role || 'buyer',
      status || 'verified',
    ];

    // If password is provided, hash it and include in update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = $${queryParams.length + 1}`;
      queryParams.push(hashedPassword);
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING *`;
    queryParams.push(userId);

    // Execute update
    const result = await pool.query(updateQuery, queryParams);

    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        companyName: updatedUser.company_name,
        role: updatedUser.role,
        status: updatedUser.status,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
      },
      { status: 500 }
    );
  }
}
