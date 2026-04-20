import { NextRequest, NextResponse } from 'next/server';
import { createInvoice } from '@/lib/database/queries/invoices';
import { updateSourcingRequestStatus } from '@/lib/database/queries/sourcing';

export async function POST(request: NextRequest) {
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

    if (!buyerId || !sourcingRequestId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * 0.16; // 16% VAT
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
    await updateSourcingRequestStatus(sourcingRequestId, 'quoted', 'Pro-forma invoice generated');

    // TODO: Send email to buyer with invoice details (mock implementation)
    console.log(`Invoice ${invoice.invoiceNumber} generated and sent to buyer ${buyerId}`);

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice generated and sent to buyer',
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate invoice',
      },
      { status: 500 }
    );
  }
}
