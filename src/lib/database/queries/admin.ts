import { query } from '../connection';

// Get dashboard KPIs
export async function getDashboardKPIs(): Promise<{
  outstandingTransfers: number;
  pendingReconciliations: number;
  activeSourcingRequests: number;
  dailyTransactionVolume: number;
  ledgerHealthScore: number;
}> {
  // Get outstanding transfers (bank transfer payments pending reconciliation)
  const outstandingQuery = `
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    WHERE p.method = 'bank-transfer' 
    AND p.status IN ('pending-reconciliation', 'received')
  `;

  // Get pending reconciliations count
  const pendingReconciliationsQuery = `
    SELECT COUNT(*) as count
    FROM payments p
    WHERE p.status = 'pending-reconciliation'
  `;

  // Get active sourcing requests count
  const activeSourcingQuery = `
    SELECT COUNT(*) as count
    FROM sourcing_requests sr
    WHERE sr.status IN ('submitted', 'under-review')
  `;

  // Get daily transaction volume (today's transactions)
  const dailyVolumeQuery = `
    SELECT COALESCE(SUM(o.total_amount), 0) as total
    FROM orders o
    WHERE DATE(o.created_at) = CURRENT_DATE
    AND o.payment_status IN ('completed', 'reconciled')
  `;

  // Get ledger health score (percentage of reconciled payments)
  const ledgerHealthQuery = `
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 100
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE p.status = 'reconciled')::NUMERIC / COUNT(*)::NUMERIC) * 100
        )
      END as health_score
    FROM payments p
    WHERE p.status IN ('reconciled', 'pending-reconciliation', 'received')
  `;

  const [outstandingResult, pendingResult, activeSourcingResult, dailyVolumeResult, ledgerHealthResult] = await Promise.all([
    query(outstandingQuery, []),
    query(pendingReconciliationsQuery, []),
    query(activeSourcingQuery, []),
    query(dailyVolumeQuery, []),
    query(ledgerHealthQuery, []),
  ]);

  return {
    outstandingTransfers: parseFloat(outstandingResult.rows[0].total),
    pendingReconciliations: parseInt(pendingResult.rows[0].count),
    activeSourcingRequests: parseInt(activeSourcingResult.rows[0].count),
    dailyTransactionVolume: parseFloat(dailyVolumeResult.rows[0].total),
    ledgerHealthScore: parseInt(ledgerHealthResult.rows[0].health_score),
  };
}

// Get inventory health data
export async function getInventoryHealth(): Promise<{
  healthScore: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    stockLevel: number;
    category: string;
    price: number;
  }>;
  outOfStockItems: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
  totalProducts: number;
  healthyProducts: number;
}> {
  // Get low stock items (less than 10 units)
  const lowStockQuery = `
    SELECT id, name, stock_level, category, price
    FROM products
    WHERE stock_level > 0 AND stock_level < 10
    ORDER BY stock_level ASC
  `;

  // Get out of stock items
  const outOfStockQuery = `
    SELECT id, name, category, price
    FROM products
    WHERE stock_level = 0
    ORDER BY name ASC
  `;

  // Get inventory health score
  const healthScoreQuery = `
    SELECT 
      ROUND(
        (COUNT(*) FILTER (WHERE stock_level > 10)::NUMERIC / COUNT(*)::NUMERIC) * 100
      ) as health_score,
      COUNT(*) as total_products,
      COUNT(*) FILTER (WHERE stock_level > 10) as healthy_products
    FROM products
  `;

  const [lowStockResult, outOfStockResult, healthScoreResult] = await Promise.all([
    query(lowStockQuery, []),
    query(outOfStockQuery, []),
    query(healthScoreQuery, []),
  ]);

  return {
    healthScore: parseInt(healthScoreResult.rows[0].health_score),
    lowStockItems: lowStockResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      stockLevel: row.stock_level,
      category: row.category,
      price: parseFloat(row.price),
    })),
    outOfStockItems: outOfStockResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: parseFloat(row.price),
    })),
    totalProducts: parseInt(healthScoreResult.rows[0].total_products),
    healthyProducts: parseInt(healthScoreResult.rows[0].healthy_products),
  };
}

// Get detailed inventory report
export async function getDetailedInventoryReport(
  page: number = 1,
  limit: number = 50
): Promise<{
  items: Array<{
    id: string;
    name: string;
    category: string;
    stockLevel: number;
    price: number;
    availability: string;
    needsRestocking: boolean;
  }>;
  total: number;
}> {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) as total FROM products
  `;

  const itemsQuery = `
    SELECT 
      id, name, category, stock_level, price, availability,
      CASE 
        WHEN stock_level < 10 THEN true
        ELSE false
      END as needs_restocking
    FROM products
    ORDER BY 
      CASE 
        WHEN stock_level < 10 THEN 0
        ELSE 1
      END,
      stock_level ASC,
      name ASC
    LIMIT $1 OFFSET $2
  `;

  const [countResult, itemsResult] = await Promise.all([
    query(countQuery, []),
    query(itemsQuery, [limit, offset]),
  ]);

  return {
    items: itemsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      stockLevel: row.stock_level,
      price: parseFloat(row.price),
      availability: row.availability,
      needsRestocking: row.needs_restocking,
    })),
    total: parseInt(countResult.rows[0].total),
  };
}

// Get open sourcing requests for dashboard
export async function getOpenSourcingRequests(limit: number = 10): Promise<
  Array<{
    id: string;
    itemDescription: string;
    quantity: number;
    buyerName: string;
    submissionDate: string;
    status: string;
  }>
> {
  const query_str = `
    SELECT 
      sr.id,
      sr.item_description,
      sr.quantity,
      u.name as buyer_name,
      sr.created_at as submission_date,
      sr.status
    FROM sourcing_requests sr
    LEFT JOIN users u ON sr.buyer_id = u.id
    WHERE sr.status IN ('submitted', 'under-review')
    ORDER BY sr.created_at DESC
    LIMIT $1
  `;

  const result = await query(query_str, [limit]);

  return result.rows.map((row: any) => ({
    id: row.id,
    itemDescription: row.item_description,
    quantity: row.quantity,
    buyerName: row.buyer_name || 'Unknown',
    submissionDate: row.submission_date,
    status: row.status,
  }));
}

// Get payment reconciliation ledger with filtering and search
export async function getPaymentReconciliationLedger(
  filters?: {
    statuses?: string[];
    searchQuery?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  ledger: Array<{
    id: string;
    paymentId: string;
    referenceCode: string;
    buyerName: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    reconciliationStatus: string;
    orderDate: string;
    proofCount: number;
  }>;
  total: number;
  page: number;
  limit: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const offset = (page - 1) * limit;
  const statuses = filters?.statuses || [];
  const searchQuery = filters?.searchQuery || '';

  // Build WHERE clause
  let whereConditions = ['1=1'];
  const queryParams: any[] = [];

  if (statuses.length > 0) {
    whereConditions.push(`p.status = ANY($${queryParams.length + 1})`);
    queryParams.push(statuses);
  }

  if (searchQuery) {
    whereConditions.push(`(o.reference_code ILIKE $${queryParams.length + 1} OR u.name ILIKE $${queryParams.length + 1})`);
    queryParams.push(`%${searchQuery}%`);
    queryParams.push(`%${searchQuery}%`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Count total records
  const countQuery = `
    SELECT COUNT(*) as total
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    LEFT JOIN users u ON o.buyer_id = u.id
    WHERE ${whereClause}
  `;

  // Get ledger records
  const ledgerQuery = `
    SELECT 
      p.id,
      p.id as payment_id,
      o.reference_code,
      u.name as buyer_name,
      p.amount,
      p.method as payment_method,
      p.status as payment_status,
      p.status as reconciliation_status,
      o.created_at as order_date,
      COUNT(pp.id) as proof_count
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN payment_proofs pp ON p.id = pp.payment_id
    WHERE ${whereClause}
    GROUP BY p.id, o.reference_code, u.name, o.created_at
    ORDER BY o.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
  `;

  const countParams = [...queryParams];
  const ledgerParams = [...queryParams, limit, offset];

  const [countResult, ledgerResult] = await Promise.all([
    query(countQuery, countParams),
    query(ledgerQuery, ledgerParams),
  ]);

  const total = parseInt(countResult.rows[0].total);

  return {
    ledger: ledgerResult.rows.map((row: any) => ({
      id: row.id,
      paymentId: row.payment_id,
      referenceCode: row.reference_code,
      buyerName: row.buyer_name || 'Unknown',
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      reconciliationStatus: row.reconciliation_status,
      orderDate: row.order_date,
      proofCount: parseInt(row.proof_count),
    })),
    total,
    page,
    limit,
  };
}

// Get payment details for reconciliation with all related data
export async function getPaymentForReconciliation(paymentId: string): Promise<{
  payment: {
    id: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    transactionId?: string;
    rejectionReason?: string;
    reconciledBy?: string;
    reconciledAt?: string;
    createdAt: string;
    updatedAt: string;
  };
  order: {
    id: string;
    referenceCode: string;
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
    shippingCity: string;
    contactName: string;
    contactPhone: string;
    createdAt: string;
  };
  proofs: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudinaryUrl: string;
    uploadedAt: string;
  }>;
} | null> {
  const paymentQuery = `
    SELECT 
      p.id,
      p.order_id,
      p.amount,
      p.method,
      p.status,
      p.transaction_id,
      p.rejection_reason,
      p.reconciled_by,
      p.reconciled_at,
      p.created_at,
      p.updated_at,
      o.id as order_id_check,
      o.reference_code,
      o.buyer_id,
      u.name as buyer_name,
      u.email as buyer_email,
      o.total_amount,
      o.payment_method,
      o.shipping_address,
      o.shipping_city,
      o.contact_name,
      o.contact_phone,
      o.created_at as order_created_at
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    LEFT JOIN users u ON o.buyer_id = u.id
    WHERE p.id = $1
  `;

  const proofsQuery = `
    SELECT 
      id,
      file_name,
      file_type,
      file_size,
      cloudinary_url,
      uploaded_at
    FROM payment_proofs
    WHERE payment_id = $1
    ORDER BY uploaded_at DESC
  `;

  const [paymentResult, proofsResult] = await Promise.all([
    query(paymentQuery, [paymentId]),
    query(proofsQuery, [paymentId]),
  ]);

  if (paymentResult.rows.length === 0) {
    return null;
  }

  const row = paymentResult.rows[0];

  return {
    payment: {
      id: row.id,
      orderId: row.order_id,
      amount: parseFloat(row.amount),
      method: row.method,
      status: row.status,
      transactionId: row.transaction_id,
      rejectionReason: row.rejection_reason,
      reconciledBy: row.reconciled_by,
      reconciledAt: row.reconciled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    order: {
      id: row.order_id_check,
      referenceCode: row.reference_code,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name || 'Unknown',
      buyerEmail: row.buyer_email || 'N/A',
      totalAmount: parseFloat(row.total_amount),
      paymentMethod: row.payment_method,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      contactName: row.contact_name,
      contactPhone: row.contact_phone,
      createdAt: row.order_created_at,
    },
    proofs: proofsResult.rows.map((p: any) => ({
      id: p.id,
      fileName: p.file_name,
      fileType: p.file_type,
      fileSize: p.file_size,
      cloudinaryUrl: p.cloudinary_url,
      uploadedAt: p.uploaded_at,
    })),
  };
}

// Calculate outstanding balance (total amount owed by buyers with pending payments)
export async function getOutstandingBalance(): Promise<number> {
  const query_str = `
    SELECT COALESCE(SUM(o.total_amount), 0) as total
    FROM orders o
    WHERE o.payment_status IN ('pending', 'processing', 'pending-reconciliation', 'received')
  `;

  const result = await query(query_str, []);
  return parseFloat(result.rows[0].total);
}

// Calculate pending reconciliation amount (total amount awaiting admin verification)
export async function getPendingReconciliationAmount(): Promise<number> {
  const query_str = `
    SELECT COALESCE(SUM(p.amount), 0) as total
    FROM payments p
    WHERE p.status = 'pending-reconciliation'
  `;

  const result = await query(query_str, []);
  return parseFloat(result.rows[0].total);
}

// Get reconciliation statistics
export async function getReconciliationStats(): Promise<{
  totalPayments: number;
  reconciledPayments: number;
  pendingPayments: number;
  receivedPayments: number;
  rejectedPayments: number;
  averageReconciliationTime: number; // in hours
}> {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_payments,
      COUNT(*) FILTER (WHERE status = 'reconciled') as reconciled_payments,
      COUNT(*) FILTER (WHERE status = 'pending-reconciliation') as pending_payments,
      COUNT(*) FILTER (WHERE status = 'received') as received_payments,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected_payments,
      ROUND(
        EXTRACT(EPOCH FROM AVG(reconciled_at - created_at)) / 3600
      )::INTEGER as avg_reconciliation_time
    FROM payments
    WHERE status IN ('reconciled', 'pending-reconciliation', 'received', 'rejected')
  `;

  const result = await query(statsQuery, []);
  const row = result.rows[0];

  return {
    totalPayments: parseInt(row.total_payments),
    reconciledPayments: parseInt(row.reconciled_payments),
    pendingPayments: parseInt(row.pending_payments),
    receivedPayments: parseInt(row.received_payments),
    rejectedPayments: parseInt(row.rejected_payments),
    averageReconciliationTime: row.avg_reconciliation_time || 0,
  };
}

// Check if payment has already been reconciled (prevent duplicates)
export async function isPaymentReconciled(paymentId: string): Promise<boolean> {
  const query_str = `
    SELECT EXISTS(
      SELECT 1 FROM payments WHERE id = $1 AND status = 'reconciled'
    ) as is_reconciled
  `;

  const result = await query(query_str, [paymentId]);
  return result.rows[0].is_reconciled;
}

// Get reconciliation action history for a payment
export async function getReconciliationHistory(paymentId: string): Promise<
  Array<{
    id: string;
    action: string;
    adminName: string;
    timestamp: string;
    reason?: string;
  }>
> {
  const historyQuery = `
    SELECT 
      p.id,
      p.status as action,
      u.name as admin_name,
      p.reconciled_at as timestamp,
      p.rejection_reason as reason
    FROM payments p
    LEFT JOIN users u ON p.reconciled_by = u.id
    WHERE p.id = $1
    ORDER BY p.reconciled_at DESC
  `;

  const result = await query(historyQuery, [paymentId]);

  return result.rows.map((row: any) => ({
    id: row.id,
    action: row.action,
    adminName: row.admin_name || 'System',
    timestamp: row.timestamp,
    reason: row.reason,
  }));
}
