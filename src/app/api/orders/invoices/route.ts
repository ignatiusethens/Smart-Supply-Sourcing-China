import { NextRequest, NextResponse } from 'next/server';
import { getBuyerInvoices } from '@/lib/database/queries/orders';
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

    const { invoices, total } = await getBuyerInvoices(userId, page, limit);
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<any>> = {
      success: true,
      data: {
        data: invoices,
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
    console.error('Error fetching invoices:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoices',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
