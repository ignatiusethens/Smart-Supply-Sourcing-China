import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from '@/lib/database/queries/orders';
import {
  createPayment,
  updatePaymentStatus as updatePaymentStatusQuery,
} from '@/lib/database/queries/payments';
import { validatePhoneNumber } from '@/lib/validation/schemas';
import { requireAuth } from '@/lib/auth/middleware';

interface MpesaPaymentRequest {
  orderId: string;
  phoneNumber: string;
}

interface MpesaPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentId: string;
    orderId: string;
    amount: number;
    phoneNumber: string;
    status: string;
    transactionId?: string;
  };
  error?: string;
}

/**
 * POST /api/payments/mpesa
 * Initiate M-Pesa STK Push payment
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<MpesaPaymentResponse>> {
  const auth = await requireAuth(request);
  if (!auth.success) return auth.response as NextResponse<MpesaPaymentResponse>;

  try {
    const body: MpesaPaymentRequest = await request.json();
    const { orderId, phoneNumber } = body;

    // Validate input
    if (!orderId || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID and phone number are required',
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Kenyan phone number format',
        },
        { status: 400 }
      );
    }

    // Get order
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (
      order.paymentStatus === 'completed' ||
      order.paymentStatus === 'reconciled'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order is already paid',
        },
        { status: 400 }
      );
    }

    // Check payment method
    if (order.paymentMethod !== 'mpesa') {
      return NextResponse.json(
        {
          success: false,
          error: 'Order payment method is not M-Pesa',
        },
        { status: 400 }
      );
    }

    // Check M-Pesa limit
    const MPESA_LIMIT = parseInt(
      process.env.NEXT_PUBLIC_MPESA_LIMIT || '300000'
    );
    if (order.totalAmount > MPESA_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `M-Pesa limit exceeded. Maximum: KES ${MPESA_LIMIT}`,
        },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await createPayment(orderId, order.totalAmount, 'mpesa');

    // Update order status to processing
    await updateOrderStatus(
      orderId,
      'pending-payment',
      undefined,
      'M-Pesa payment initiated'
    );
    await updatePaymentStatusQuery(payment.id, 'processing');

    // In production, this would call the Safaricom Daraja API
    // For now, we'll simulate the STK Push with a mock transaction ID
    const mockTransactionId = `MPESA-${Date.now()}`;

    // Simulate STK Push - in production this would be an actual API call
    // const stkPushResponse = await initiateStkPush(phoneNumber, order.totalAmount, order.referenceCode);

    // For demo purposes, we'll return success immediately
    // In production, you would wait for the callback from Safaricom

    return NextResponse.json(
      {
        success: true,
        message:
          'M-Pesa STK Push initiated. Please check your phone for the payment prompt.',
        data: {
          paymentId: payment.id,
          orderId: order.id,
          amount: order.totalAmount,
          phoneNumber,
          status: 'processing',
          transactionId: mockTransactionId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate M-Pesa payment',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/mpesa?paymentId=xxx
 * Get M-Pesa payment status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment ID is required',
        },
        { status: 400 }
      );
    }

    // In production, this would query the payment status from the database
    // and potentially check with Safaricom for the latest status

    return NextResponse.json(
      {
        success: true,
        data: {
          paymentId,
          status: 'processing',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get M-Pesa payment status error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get payment status',
      },
      { status: 500 }
    );
  }
}
