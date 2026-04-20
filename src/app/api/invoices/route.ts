import { NextRequest, NextResponse } from 'next/server';
import { createInvoice, getAllInvoices } from '@/lib/database/queries/invoices';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status')?.split(',');

    const result = await getAllInvoices({
      status: status && status.length > 0 ? status : undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.invoices,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invoices',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId,
      sourcingRequestId,
      quoteId,
      orderId,
      lineItems,
      subtotal,
      taxAmount,
      totalAmount,
      termsAndConditions,
      paymentInstructions,
      settlementInstructions,
    } = body;

    if (!buyerId || !lineItems || !subtotal || !totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const invoice = await createInvoice(buyerId, {
      sourcingRequestId,
      quoteId,
      orderId,
      lineItems,
      subtotal,
      taxAmount,
      totalAmount,
      termsAndConditions,
      paymentInstructions,
      settlementInstructions,
    });

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create invoice',
      },
      { status: 500 }
    );
  }
}
