import { query, transaction } from '../connection';
import { Order, OrderItem, TimelineEvent, CreateOrderRequest } from '@/types';
import { generateUniqueReferenceCode } from '@/lib/algorithms/referenceCode';

// Get orders for a specific user
export async function getUserOrders(userId: string): Promise<Order[]> {
  const ordersQuery = `
    SELECT 
      o.*,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name,
        'role', u.role
      ) as buyer,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'orderId', oi.order_id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'subtotal', oi.subtotal,
            'isPreOrder', oi.is_pre_order
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) as items
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = $1
    GROUP BY o.id, u.id
    ORDER BY o.created_at DESC
  `;

  const result = await query(ordersQuery, [userId]);
  
  return result.rows.map(row => ({
    id: row.id,
    referenceCode: row.reference_code,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    items: row.items || [],
    timeline: [], // Will be loaded separately if needed
    payments: [], // Will be loaded separately if needed
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Get single order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  const orderQuery = `
    SELECT 
      o.*,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name,
        'role', u.role
      ) as buyer,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', oi.id,
            'orderId', oi.order_id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'subtotal', oi.subtotal,
            'isPreOrder', oi.is_pre_order
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) as items,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', ot.id,
            'orderId', ot.order_id,
            'status', ot.status,
            'description', ot.description,
            'actorId', ot.actor_id,
            'createdAt', ot.created_at
          )
        ) FILTER (WHERE ot.id IS NOT NULL),
        '[]'::json
      ) as timeline
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN order_timeline ot ON o.id = ot.order_id
    WHERE o.id = $1
    GROUP BY o.id, u.id
  `;

  const result = await query(orderQuery, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  
  return {
    id: row.id,
    referenceCode: row.reference_code,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    items: row.items || [],
    timeline: row.timeline || [],
    payments: [], // Will be loaded separately if needed
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Create new order
export async function createOrder(
  orderData: CreateOrderRequest,
  buyerId: string
): Promise<Order> {
  return await transaction(async (client) => {
    // Generate unique reference code
    const referenceCode = await generateUniqueReferenceCode();

    // Calculate total amount by fetching product prices
    let totalAmount = 0;
    let depositAmount = 0;
    const orderItems: any[] = [];

    for (const item of orderData.items) {
      const productQuery = 'SELECT * FROM products WHERE id = $1';
      const productResult = await client.query(productQuery, [item.productId]);
      
      if (productResult.rows.length === 0) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = productResult.rows[0];
      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;

      // Calculate deposit for pre-order items
      if (product.availability === 'pre-order' && product.deposit_amount) {
        depositAmount += parseFloat(product.deposit_amount) * item.quantity;
      }

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(product.price),
        subtotal,
        isPreOrder: product.availability === 'pre-order',
      });
    }

    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        reference_code, buyer_id, total_amount, deposit_amount, payment_method,
        payment_status, order_status, shipping_address, shipping_city,
        contact_name, contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const orderResult = await client.query(orderQuery, [
      referenceCode,
      buyerId,
      totalAmount,
      depositAmount > 0 ? depositAmount : null,
      orderData.paymentMethod,
      'pending',
      'pending-payment',
      orderData.shippingAddress,
      orderData.shippingCity,
      orderData.contactName,
      orderData.contactPhone,
    ]);

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id, product_id, product_name, quantity, unit_price, subtotal, is_pre_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await client.query(itemQuery, [
        order.id,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        item.isPreOrder,
      ]);
    }

    // Insert initial timeline event
    const timelineQuery = `
      INSERT INTO order_timeline (order_id, status, description)
      VALUES ($1, $2, $3)
    `;

    await client.query(timelineQuery, [
      order.id,
      'pending-payment',
      'Order created and awaiting payment',
    ]);

    // Return the created order
    return {
      id: order.id,
      referenceCode: order.reference_code,
      buyerId: order.buyer_id,
      totalAmount: parseFloat(order.total_amount),
      depositAmount: order.deposit_amount ? parseFloat(order.deposit_amount) : undefined,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      contactName: order.contact_name,
      contactPhone: order.contact_phone,
      items: orderItems,
      timeline: [{
        id: '', // Will be generated
        orderId: order.id,
        status: 'pending-payment',
        description: 'Order created and awaiting payment',
        createdAt: order.created_at,
      }],
      payments: [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  });
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  actorId?: string,
  description?: string
): Promise<boolean> {
  return await transaction(async (client) => {
    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET order_status = $2, updated_at = NOW()
      WHERE id = $1
    `;

    const result = await client.query(updateQuery, [orderId, newStatus]);

    if (result.rowCount === 0) {
      return false;
    }

    // Add timeline event
    const timelineQuery = `
      INSERT INTO order_timeline (order_id, status, description, actor_id)
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(timelineQuery, [
      orderId,
      newStatus,
      description || `Order status updated to ${newStatus}`,
      actorId,
    ]);

    return true;
  });
}

// Update payment status
export async function updatePaymentStatus(
  orderId: string,
  newStatus: string,
  transactionId?: string
): Promise<boolean> {
  return await transaction(async (client) => {
    // Update payment status
    const updateQuery = `
      UPDATE orders 
      SET payment_status = $2, updated_at = NOW()
      WHERE id = $1
    `;

    const result = await client.query(updateQuery, [orderId, newStatus]);

    if (result.rowCount === 0) {
      return false;
    }

    // Add timeline event
    const timelineQuery = `
      INSERT INTO order_timeline (order_id, status, description)
      VALUES ($1, $2, $3)
    `;

    await client.query(timelineQuery, [
      orderId,
      newStatus,
      `Payment status updated to ${newStatus}${transactionId ? ` (Transaction: ${transactionId})` : ''}`,
    ]);

    return true;
  });
}

// Get all orders (Admin)
export async function getAllOrders(
  page: number = 1,
  limit: number = 20,
  filters?: {
    paymentStatus?: string[];
    orderStatus?: string[];
    paymentMethod?: string[];
  }
): Promise<{ orders: Order[]; total: number }> {
  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.paymentStatus && filters.paymentStatus.length > 0) {
    conditions.push(`o.payment_status = ANY($${paramIndex})`);
    params.push(filters.paymentStatus);
    paramIndex++;
  }

  if (filters?.orderStatus && filters.orderStatus.length > 0) {
    conditions.push(`o.order_status = ANY($${paramIndex})`);
    params.push(filters.orderStatus);
    paramIndex++;
  }

  if (filters?.paymentMethod && filters.paymentMethod.length > 0) {
    conditions.push(`o.payment_method = ANY($${paramIndex})`);
    params.push(filters.paymentMethod);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Get orders
  const ordersQuery = `
    SELECT 
      o.*,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name,
        'role', u.role
      ) as buyer
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);
  const result = await query(ordersQuery, params);
  
  const orders: Order[] = result.rows.map(row => ({
    id: row.id,
    referenceCode: row.reference_code,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    items: [], // Will be loaded separately if needed
    timeline: [], // Will be loaded separately if needed
    payments: [], // Will be loaded separately if needed
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { orders, total };
}


// Get buyer's dashboard summary
export async function getBuyerDashboardSummary(buyerId: string): Promise<{
  outstandingBalance: number;
  pendingReconciliation: number;
  totalOrders: number;
  completedOrders: number;
}> {
  const summaryQuery = `
    SELECT 
      COALESCE(SUM(CASE WHEN o.payment_status NOT IN ('reconciled', 'completed') THEN o.total_amount ELSE 0 END), 0) as outstanding_balance,
      COALESCE(SUM(CASE WHEN o.payment_status = 'pending-reconciliation' THEN o.total_amount ELSE 0 END), 0) as pending_reconciliation,
      COUNT(*) as total_orders,
      COUNT(CASE WHEN o.order_status = 'completed' THEN 1 END) as completed_orders
    FROM orders o
    WHERE o.buyer_id = $1
  `;

  const result = await query(summaryQuery, [buyerId]);
  const row = result.rows[0];

  return {
    outstandingBalance: parseFloat(row.outstanding_balance),
    pendingReconciliation: parseFloat(row.pending_reconciliation),
    totalOrders: parseInt(row.total_orders),
    completedOrders: parseInt(row.completed_orders),
  };
}

// Get buyer's payment history
export async function getBuyerPaymentHistory(
  buyerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ payments: any[]; total: number }> {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    WHERE o.buyer_id = $1
  `;

  const countResult = await query(countQuery, [buyerId]);
  const total = parseInt(countResult.rows[0].total);

  const paymentsQuery = `
    SELECT 
      p.id,
      p.order_id,
      o.reference_code,
      p.amount,
      p.method,
      p.status,
      p.created_at,
      p.updated_at,
      json_agg(
        json_build_object(
          'id', oi.id,
          'productName', oi.product_name,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price
        )
      ) as items
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = $1
    GROUP BY p.id, p.order_id, o.reference_code
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await query(paymentsQuery, [buyerId, limit, offset]);

  return {
    payments: result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      referenceCode: row.reference_code,
      amount: parseFloat(row.amount),
      method: row.method,
      status: row.status,
      items: row.items || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    total,
  };
}

// Get orders by status for buyer
export async function getBuyerOrdersByStatus(
  buyerId: string,
  status: string
): Promise<Order[]> {
  const ordersQuery = `
    SELECT 
      o.*,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name,
        'role', u.role
      ) as buyer,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', oi.id,
            'orderId', oi.order_id,
            'productId', oi.product_id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'subtotal', oi.subtotal,
            'isPreOrder', oi.is_pre_order
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) as items
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = $1 AND o.order_status = $2
    GROUP BY o.id, u.id
    ORDER BY o.created_at DESC
  `;

  const result = await query(ordersQuery, [buyerId, status]);

  return result.rows.map(row => ({
    id: row.id,
    referenceCode: row.reference_code,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    items: row.items || [],
    timeline: [],
    payments: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}


// Get buyer's transactions grouped by status
export async function getBuyerTransactionsByStatus(
  buyerId: string,
  status?: string
): Promise<any[]> {
  let whereClause = 'WHERE o.buyer_id = $1';
  const params: any[] = [buyerId];

  if (status) {
    whereClause += ' AND p.status = $2';
    params.push(status);
  }

  const transactionsQuery = `
    SELECT 
      p.id,
      p.order_id,
      o.reference_code,
      p.amount,
      p.method,
      p.status,
      p.created_at,
      p.updated_at,
      json_agg(
        json_build_object(
          'id', oi.id,
          'productName', oi.product_name,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price
        )
      ) as items
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY p.id, p.order_id, o.reference_code
    ORDER BY p.created_at DESC
  `;

  const result = await query(transactionsQuery, params);

  return result.rows.map(row => ({
    id: row.id,
    orderId: row.order_id,
    referenceCode: row.reference_code,
    amount: parseFloat(row.amount),
    method: row.method,
    status: row.status,
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Get invoice data for a specific order
export async function getOrderInvoice(orderId: string): Promise<any | null> {
  const invoiceQuery = `
    SELECT 
      o.id,
      o.reference_code,
      o.total_amount,
      o.deposit_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.shipping_address,
      o.shipping_city,
      o.contact_name,
      o.contact_phone,
      o.created_at,
      o.updated_at,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name
      ) as buyer,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', oi.id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'subtotal', oi.subtotal,
            'isPreOrder', oi.is_pre_order
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) as items,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', p.id,
            'amount', p.amount,
            'method', p.method,
            'status', p.status,
            'createdAt', p.created_at
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::json
      ) as payments
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE o.id = $1
    GROUP BY o.id, u.id
  `;

  const result = await query(invoiceQuery, [orderId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    referenceCode: row.reference_code,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    buyer: row.buyer,
    items: row.items || [],
    payments: row.payments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get all invoices for a buyer
export async function getBuyerInvoices(
  buyerId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ invoices: any[]; total: number }> {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM orders o
    WHERE o.buyer_id = $1 AND o.order_status IN ('completed', 'shipped', 'processing')
  `;

  const countResult = await query(countQuery, [buyerId]);
  const total = parseInt(countResult.rows[0].total);

  const invoicesQuery = `
    SELECT 
      o.id,
      o.reference_code,
      o.total_amount,
      o.deposit_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.shipping_address,
      o.shipping_city,
      o.contact_name,
      o.contact_phone,
      o.created_at,
      o.updated_at,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name
      ) as buyer,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', oi.id,
            'productName', oi.product_name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'subtotal', oi.subtotal
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) as items
    FROM orders o
    LEFT JOIN users u ON o.buyer_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = $1 AND o.order_status IN ('completed', 'shipped', 'processing')
    GROUP BY o.id, u.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await query(invoicesQuery, [buyerId, limit, offset]);

  const invoices = result.rows.map(row => ({
    id: row.id,
    referenceCode: row.reference_code,
    totalAmount: parseFloat(row.total_amount),
    depositAmount: row.deposit_amount ? parseFloat(row.deposit_amount) : undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    shippingCity: row.shipping_city,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    buyer: row.buyer,
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { invoices, total };
}
