import { NextRequest, NextResponse } from 'next/server';
import { getBuyerPaymentHistory } from '@/lib/database/queries/orders';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        error: 'userId parameter required',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { payments, total } = await getBuyerPaymentHistory(userId, page, limit);
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<unknown>> = {
      success: true,
      data: {
        data: payments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payment history:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment history',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
