import { query, transaction } from '../connection';
import { Quote, QuoteLineItem, CreateQuoteRequest } from '@/types';

// Create a new quote
export async function createQuote(
  sourcingRequestId: string,
  buyerId: string,
  lineItems: Array<{
    description: string;
    specifications?: string;
    quantity: number;
    unitPrice: number;
  }>,
  validUntil: string
): Promise<Quote> {
  return transaction(async (client) => {
    // Calculate total amount
    const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Insert quote
    const quoteQuery = `
      INSERT INTO quotes (sourcing_request_id, buyer_id, total_amount, valid_until, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const quoteResult = await client.query(quoteQuery, [sourcingRequestId, buyerId, totalAmount, validUntil, 'pending']);

    const quote = quoteResult.rows[0];

    // Insert line items
    const lineItemsData: QuoteLineItem[] = [];
    for (const item of lineItems) {
      const subtotal = item.quantity * item.unitPrice;
      const lineItemQuery = `
        INSERT INTO quote_line_items (quote_id, description, specifications, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const lineItemResult = await client.query(lineItemQuery, [
        quote.id,
        item.description,
        item.specifications || null,
        item.quantity,
        item.unitPrice,
        subtotal,
      ]);

      const lineItem = lineItemResult.rows[0];
      lineItemsData.push({
        id: lineItem.id,
        quoteId: lineItem.quote_id,
        description: lineItem.description,
        specifications: lineItem.specifications,
        quantity: lineItem.quantity,
        unitPrice: parseFloat(lineItem.unit_price),
        subtotal: parseFloat(lineItem.subtotal),
      });
    }

    // Update sourcing request status to 'quoted'
    await client.query('UPDATE sourcing_requests SET status = $1, updated_at = NOW() WHERE id = $2', ['quoted', sourcingRequestId]);

    return {
      id: quote.id,
      sourcingRequestId: quote.sourcing_request_id,
      buyerId: quote.buyer_id,
      totalAmount: parseFloat(quote.total_amount),
      validUntil: quote.valid_until,
      status: quote.status,
      orderId: quote.order_id,
      lineItems: lineItemsData,
      createdAt: quote.created_at,
      acceptedAt: quote.accepted_at,
    };
  });
}

// Get quote by ID
export async function getQuoteById(id: string): Promise<Quote | null> {
  const quoteQuery = `
    SELECT 
      q.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', qli.id,
            'quoteId', qli.quote_id,
            'description', qli.description,
            'specifications', qli.specifications,
            'quantity', qli.quantity,
            'unitPrice', qli.unit_price,
            'subtotal', qli.subtotal
          )
        ) FILTER (WHERE qli.id IS NOT NULL),
        '[]'::json
      ) as lineItems
    FROM quotes q
    LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
    WHERE q.id = $1
    GROUP BY q.id
  `;

  const result = await query(quoteQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: (row.lineItems || []).map((item: any) => ({
      id: item.id,
      quoteId: item.quoteId,
      description: item.description,
      specifications: item.specifications,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal),
    })),
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

// Get quotes for a sourcing request
export async function getQuotesBySourcingRequest(sourcingRequestId: string): Promise<Quote[]> {
  const quotesQuery = `
    SELECT 
      q.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', qli.id,
            'quoteId', qli.quote_id,
            'description', qli.description,
            'specifications', qli.specifications,
            'quantity', qli.quantity,
            'unitPrice', qli.unit_price,
            'subtotal', qli.subtotal
          )
        ) FILTER (WHERE qli.id IS NOT NULL),
        '[]'::json
      ) as lineItems
    FROM quotes q
    LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
    WHERE q.sourcing_request_id = $1
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;

  const result = await query(quotesQuery, [sourcingRequestId]);

  return result.rows.map((row) => ({
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: (row.lineItems || []).map((item: any) => ({
      id: item.id,
      quoteId: item.quoteId,
      description: item.description,
      specifications: item.specifications,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal),
    })),
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  }));
}

// Get quotes for a buyer
export async function getBuyerQuotes(buyerId: string): Promise<Quote[]> {
  const quotesQuery = `
    SELECT 
      q.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', qli.id,
            'quoteId', qli.quote_id,
            'description', qli.description,
            'specifications', qli.specifications,
            'quantity', qli.quantity,
            'unitPrice', qli.unit_price,
            'subtotal', qli.subtotal
          )
        ) FILTER (WHERE qli.id IS NOT NULL),
        '[]'::json
      ) as lineItems
    FROM quotes q
    LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
    WHERE q.buyer_id = $1
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;

  const result = await query(quotesQuery, [buyerId]);

  return result.rows.map((row) => ({
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: (row.lineItems || []).map((item: any) => ({
      id: item.id,
      quoteId: item.quoteId,
      description: item.description,
      specifications: item.specifications,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal),
    })),
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  }));
}

// Update quote status
export async function updateQuoteStatus(id: string, status: string): Promise<Quote | null> {
  const updateQuery = `
    UPDATE quotes
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await query(updateQuery, [status, id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: [],
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

// Accept quote and create order
export async function acceptQuote(quoteId: string, orderId: string): Promise<Quote | null> {
  const updateQuery = `
    UPDATE quotes
    SET status = $1, order_id = $2, accepted_at = NOW(), updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await query(updateQuery, ['accepted', orderId, quoteId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: [],
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

// Get expired quotes
export async function getExpiredQuotes(): Promise<Quote[]> {
  const quotesQuery = `
    SELECT 
      q.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', qli.id,
            'quoteId', qli.quote_id,
            'description', qli.description,
            'specifications', qli.specifications,
            'quantity', qli.quantity,
            'unitPrice', qli.unit_price,
            'subtotal', qli.subtotal
          )
        ) FILTER (WHERE qli.id IS NOT NULL),
        '[]'::json
      ) as lineItems
    FROM quotes q
    LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
    WHERE q.status = 'pending' AND q.valid_until < NOW()
    GROUP BY q.id
  `;

  const result = await query(quotesQuery, []);

  return result.rows.map((row) => ({
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: (row.lineItems || []).map((item: any) => ({
      id: item.id,
      quoteId: item.quoteId,
      description: item.description,
      specifications: item.specifications,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal),
    })),
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  }));
}

// Mark expired quotes as expired
export async function markExpiredQuotes(): Promise<void> {
  const updateQuery = `
    UPDATE quotes
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' AND valid_until < NOW()
  `;

  await query(updateQuery, []);
}
