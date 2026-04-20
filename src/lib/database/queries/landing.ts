import { query } from '../connection';
import { Product, Quote } from '@/types';

/**
 * Get featured products for landing page
 * Returns up to 6 products with in-stock availability, ordered by creation date
 */
export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.category,
      p.price,
      p.availability,
      p.stock_level,
      p.description,
      p.warranty_duration,
      p.warranty_terms,
      p.deposit_amount,
      p.deposit_percentage,
      p.batch_arrival_date,
      p.escrow_details,
      p.image_urls,
      p.created_at,
      p.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ps.id,
            'productId', ps.product_id,
            'label', ps.label,
            'value', ps.value
          )
        ) FILTER (WHERE ps.id IS NOT NULL),
        '[]'::json
      ) as specifications
    FROM products p
    LEFT JOIN product_specifications ps ON p.id = ps.product_id
    WHERE p.availability = 'in-stock'
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    availability: row.availability,
    stockLevel: row.stock_level,
    description: row.description,
    warrantyDuration: row.warranty_duration,
    warrantyTerms: row.warranty_terms,
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    depositPercentage: row.deposit_percentage,
    batchArrivalDate: row.batch_arrival_date,
    escrowDetails: row.escrow_details,
    imageUrls: row.image_urls || [],
    specifications: row.specifications || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get recent unpaid quotes for landing page
 * Returns up to 5 quotes with pending status, ordered by creation date
 */
export async function getRecentUnpaidQuotes(limit: number = 5): Promise<Quote[]> {
  const sql = `
    SELECT 
      q.id,
      q.sourcing_request_id,
      q.buyer_id,
      q.total_amount,
      q.valid_until,
      q.status,
      q.order_id,
      q.created_at,
      q.accepted_at,
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
    WHERE q.status = 'pending' AND q.valid_until > NOW()
    GROUP BY q.id
    ORDER BY q.created_at DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);

  return result.rows.map((row) => ({
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    validUntil: row.valid_until,
    status: row.status,
    orderId: row.order_id,
    lineItems: row.lineItems || [],
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  }));
}

/**
 * Calculate days remaining until quote expiration
 */
export function getDaysUntilExpiration(validUntil: string): number {
  const expirationDate = new Date(validUntil);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
