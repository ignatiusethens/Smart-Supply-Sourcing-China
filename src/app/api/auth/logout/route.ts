import { NextRequest, NextResponse } from 'next/server';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

/**
 * POST /api/auth/logout
 * Logout user (clear session)
 */
export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  try {
    // In a real application, you would invalidate the session token here
    // For now, we just return success as the client will clear localStorage

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
