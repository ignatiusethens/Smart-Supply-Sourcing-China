import { NextRequest, NextResponse } from 'next/server';
import { getOrderInvoice } from '@/lib/database/queries/orders';
import { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getOrderInvoice(id);

    if (!invoice) {
      const response: ApiResponse = {
        success: false,
        error: 'Invoice not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: invoice,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching invoice:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
