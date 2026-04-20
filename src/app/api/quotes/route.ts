import { NextRequest, NextResponse } from 'next/server';
import { createQuote, getBuyerQuotes, getQuoteById } from '@/lib/database/queries/quotes';
import { markExpiredQuotes } from '@/lib/database/queries/quotes';

// POST - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourcingRequestId, buyerId, lineItems, validUntil } = body;

    if (!sourcingRequestId || !buyerId || !lineItems || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    const quote = await createQuote(sourcingRequestId, buyerId, lineItems, validUntil);

    return NextResponse.json(
      {
        success: true,
        data: quote,
        message: 'Quote created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// GET - Get quotes
export async function GET(request: NextRequest) {
  try {
    // Mark expired quotes first
    await markExpiredQuotes();

    const searchParams = request.nextUrl.searchParams;
    const buyerId = searchParams.get('buyerId');

    if (buyerId) {
      const quotes = await getBuyerQuotes(buyerId);
      return NextResponse.json({
        success: true,
        data: quotes,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
