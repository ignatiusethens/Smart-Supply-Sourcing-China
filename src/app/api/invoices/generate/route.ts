import { NextRequest, NextResponse } from 'next/server';
import { createInvoice } from '@/lib/database/queries/invoices';
import {
  updateSourcingRequestStatus,
  getSourcingRequestById,
} from '@/lib/database/queries/sourcing';
import { requireAdmin } from '@/lib/auth/middleware';
import { sendQuoteNotificationToBuyer } from '@/lib/email/sendEmail';
import { getPool } from '@/lib/database/connection';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const {
      buyerId,
      sourcingRequestId,
      lineItems,
      termsAndConditions,
      paymentInstructions,
      settlementInstructions,
    } = body;

    if (
      !buyerId ||
      !sourcingRequestId ||
      !lineItems ||
      lineItems.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * 0.16;
    const totalAmount = subtotal + taxAmount;

    // Create invoice
    const invoice = await createInvoice(buyerId, {
      sourcingRequestId,
      lineItems,
      subtotal,
      taxAmount,
      totalAmount,
      termsAndConditions,
      paymentInstructions,
      settlementInstructions,
    });

    // Update sourcing request status to "quoted"
    await updateSourcingRequestStatus(
      sourcingRequestId,
      'quoted',
      'Pro-forma invoice generated'
    );

    // Fetch buyer details for notifications
    const sourcingRequest = await getSourcingRequestById(sourcingRequestId);
    const pool = getPool();
    const buyerResult = await pool.query(
      'SELECT name, email, phone FROM users WHERE id = $1',
      [buyerId]
    );
    const buyer = buyerResult.rows[0];

    if (buyer && sourcingRequest) {
      // Send email + WhatsApp notification to buyer (non-blocking)
      void sendQuoteNotificationToBuyer({
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        itemDescription: sourcingRequest.itemDescription,
        totalAmount,
        quoteId: invoice.quoteId || sourcingRequestId,
        invoiceNumber: invoice.invoiceNumber,
      });
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice generated and buyer notified',
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
