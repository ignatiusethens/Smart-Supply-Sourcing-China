import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';
import { getPool } from '@/lib/database/connection';
import { User } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  jwtPayload?: JWTPayload;
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ authenticated: boolean; user?: User; error?: string }> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return { authenticated: false, error: 'No authentication token provided' };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  // Fetch user from database to ensure they still exist and get latest data
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, email, name, phone, company_name, role, created_at, updated_at FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return { authenticated: false, error: 'User not found' };
    }

    const dbUser = result.rows[0];
    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      companyName: dbUser.company_name,
      role: dbUser.role,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };

    return { authenticated: true, user };
  } catch (error) {
    console.error('Database error during authentication:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ success: true; user: User } | { success: false; response: NextResponse }> {
  const auth = await authenticateRequest(request);

  if (!auth.authenticated || !auth.user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: auth.error || 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { success: true, user: auth.user };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ success: true; user: User } | { success: false; response: NextResponse }> {
  const auth = await requireAuth(request);

  if (!auth.success) {
    return auth;
  }

  if (auth.user.role !== 'admin') {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { success: true, user: auth.user };
}

/**
 * Middleware to require buyer role
 */
export async function requireBuyer(
  request: NextRequest
): Promise<{ success: true; user: User } | { success: false; response: NextResponse }> {
  const auth = await requireAuth(request);

  if (!auth.success) {
    return auth;
  }

  if (auth.user.role !== 'buyer') {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Buyer access required' },
        { status: 403 }
      ),
    };
  }

  return { success: true, user: auth.user };
}
