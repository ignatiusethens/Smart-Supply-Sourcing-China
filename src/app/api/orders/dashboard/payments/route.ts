import { NextRequest, NextResponse } from 'next/server';
import { getBuyerPaymentHistory } from '@/lib/database/queries/orders';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page')
      ? Number(searchParams.get('page'))
      : 1;
    const limit = searchParams.get('limit')
      ? Number(searchParams.get('limit'))
      : 10;

    const { payments, total } = await getBuyerPaymentHistory(
      auth.user.id,
      page,
      limit
    );
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<unknown>> = {
      success: true,
      data: {
        data: payments,
        pagination: { page, limit, total, totalPages },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payment history:', error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch payment history',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
