import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { User } from '@/types';

interface MeResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  const auth = await requireAuth(request);

  if (!auth.success) {
    return auth.response as NextResponse<MeResponse>;
  }

  return NextResponse.json(
    { success: true, user: auth.user },
    { status: 200 }
  );
}
