import { NextRequest, NextResponse } from 'next/server';
import { getBuyerDashboardSummary } from '@/lib/database/queries/orders';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: 'userId parameter required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const summary = await getBuyerDashboardSummary(userId);

    const response: ApiResponse = {
      success: true,
      data: summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
