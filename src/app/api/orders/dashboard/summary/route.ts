import { NextRequest, NextResponse } from 'next/server';
import { getBuyerDashboardSummary } from '@/lib/database/queries/orders';
import { ApiResponse } from '@/types/api';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  try {
    const summary = await getBuyerDashboardSummary(auth.user.id);

    const response: ApiResponse = {
      success: true,
      data: summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch dashboard summary',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
