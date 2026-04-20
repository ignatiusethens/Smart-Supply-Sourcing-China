import { NextRequest, NextResponse } from 'next/server';
import { getBuyerTransactionsByStatus } from '@/lib/database/queries/orders';
import { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: 'userId parameter required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const transactions = await getBuyerTransactionsByStatus(userId, status || undefined);

    const response: ApiResponse = {
      success: true,
      data: {
        transactions,
        status: status || 'all',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
