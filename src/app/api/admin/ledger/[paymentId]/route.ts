import { NextRequest, NextResponse } from 'next/server';
import { getPaymentForReconciliation } from '@/lib/database/queries/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    const result = await getPaymentForReconciliation(paymentId);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment details',
      },
      { status: 500 }
    );
  }
}
