import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/database/queries/orders';
import { getPaymentByOrderId } from '@/lib/database/queries/payments';
import { ApiResponse } from '@/types/api';
import { Order, Payment } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      const response: ApiResponse = {
        success: false,
        error: 'Order not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Fetch payment information
    const payment = await getPaymentByOrderId(id);

    const response: ApiResponse<{ order: Order; payment: Payment | null }> = {
      success: true,
      data: {
        order,
        payment,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };

    return NextResponse.json(response, { status: 500 });
  }
}