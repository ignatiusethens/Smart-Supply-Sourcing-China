import { NextRequest, NextResponse } from 'next/server';
import { reconcilePayment } from '@/lib/database/queries/payments';
import { getDashboardKPIs } from '@/lib/database/queries/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, action, rejectionReason, adminId } = body;

    if (!paymentId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: paymentId, action',
        },
        { status: 400 }
      );
    }

    if (!['received', 'reconciled', 'rejected'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be one of: received, reconciled, rejected',
        },
        { status: 400 }
      );
    }

    if (action === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rejection reason is required when rejecting a payment',
        },
        { status: 400 }
      );
    }

    // Reconcile the payment
    const payment = await reconcilePayment(
      paymentId,
      action as 'received' | 'reconciled' | 'rejected',
      adminId,
      rejectionReason
    );

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
        },
        { status: 404 }
      );
    }

    // Get updated KPIs
    const kpis = await getDashboardKPIs();

    return NextResponse.json({
      success: true,
      data: {
        payment,
        kpis,
      },
      message: `Payment ${action} successfully`,
    });
  } catch (error) {
    console.error('Error reconciling payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reconcile payment',
      },
      { status: 500 }
    );
  }
}
