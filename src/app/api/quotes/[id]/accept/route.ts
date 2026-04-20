import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById, acceptQuote } from '@/lib/database/queries/quotes';
import { transaction } from '@/lib/database/connection';

// POST - Accept a quote and create an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentMethod } = body;

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Get the quote
    const quote = await getQuoteById(id);

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if quote is expired
    if (quote.status === 'expired' || (quote.status === 'pending' && new Date(quote.validUntil) < new Date())) {
      return NextResponse.json(
        { error: 'Quote has expired' },
        { status: 400 }
      );
    }

    // Check if quote is already accepted
    if (quote.status !== 'pending') {
      return NextResponse.json(
        { error: 'Quote cannot be accepted in its current status' },
        { status: 400 }
      );
    }

    // Create an order from the quote
    const result = await transaction(async (client) => {
      // Create order with quote line items
      const orderQuery = `
        INSERT INTO orders (
          reference_code, buyer_id, total_amount, payment_method,
          payment_status, order_status, shipping_address, shipping_city,
          contact_name, contact_phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      // Generate reference code
      const referenceCode = `SSS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const orderResult = await client.query(orderQuery, [
        referenceCode,
        quote.buyerId,
        quote.totalAmount,
        paymentMethod,
        'pending',
        'pending-payment',
        'TBD', // Will be updated later
        'TBD', // Will be updated later
        'TBD', // Will be updated later
        'TBD', // Will be updated later
      ]);

      const order = orderResult.rows[0];

      // Add order items from quote line items
      for (const lineItem of quote.lineItems) {
        await client.query(
          `
          INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal, is_pre_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            order.id,
            null, // No product_id for sourcing quotes
            lineItem.description,
            lineItem.quantity,
            lineItem.unitPrice,
            lineItem.subtotal,
            false,
          ]
        );
      }

      // Add timeline event
      await client.query(
        `
        INSERT INTO order_timeline (order_id, status, description)
        VALUES ($1, $2, $3)
        `,
        [order.id, 'pending-payment', 'Order created from quote']
      );

      // Accept the quote and link to order
      await acceptQuote(id, order.id);

      return {
        orderId: order.id,
        referenceCode: order.reference_code,
        totalAmount: parseFloat(order.total_amount),
        paymentMethod,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Quote accepted and order created successfully',
    });
  } catch (error) {
    console.error('Error accepting quote:', error);
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
