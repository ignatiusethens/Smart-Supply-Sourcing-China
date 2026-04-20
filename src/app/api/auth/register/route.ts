import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database/connection';
import { User } from '@/types';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  companyName?: string;
  role?: 'buyer' | 'admin';
}

interface RegisterResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * POST /api/auth/register
 * Register a new user with password hashing and JWT token generation
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    const body: RegisterRequest = await request.json();

    // Validate input
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [body.email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create new user
    const role = body.role || 'buyer';
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, company_name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, name, phone, company_name, role, created_at, updated_at`,
      [body.email, passwordHash, body.name, body.phone || null, body.companyName || null, role]
    );

    const user = result.rows[0];

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      companyName: user.company_name,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    // Generate JWT token
    const token = generateToken(userData);

    return NextResponse.json(
      { success: true, user: userData, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
