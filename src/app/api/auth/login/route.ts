import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { User } from '@/types';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * POST /api/auth/login
 * Authenticate user with email and password, return JWT token
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse>> {
  try {
    const body: LoginRequest = await request.json();

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Query user from database (including password_hash for verification)
    const result = await pool.query(
      'SELECT id, email, name, phone, company_name, role, password_hash, status, created_at, updated_at FROM users WHERE email = $1',
      [body.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check if user is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        {
          success: false,
          error: 'Your account has been suspended. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      body.password,
      user.password_hash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user object (without password hash)
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      companyName: user.company_name,
      role: user.role,
      status: user.status || 'verified',
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    // Generate JWT token
    const token = generateToken(userData);

    return NextResponse.json(
      { success: true, user: userData, token },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
