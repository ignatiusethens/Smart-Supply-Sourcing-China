import { query, transaction } from '../connection';
import { Payment, PaymentProof, PaymentStatus } from '@/types';

// Create a payment record
export async function createPayment(
  orderId: string,
  amount: number,
  method: 'mpesa' | 'bank-transfer'
): Promise<Payment> {
  const paymentQuery = `
    INSERT INTO payments (order_id, amount, method, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await query(paymentQuery, [orderId, amount, method, 'pending']);
  const row = result.rows[0];

  return {
    id: row.id,
    orderId: row.order_id,
    amount: parseFloat(row.amount),
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id,
    rejectionReason: row.rejection_reason,
    reconciledBy: row.reconciled_by,
    reconciledAt: row.reconciled_at,
    proofs: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get payment by ID
export async function getPaymentById(id: string): Promise<Payment | null> {
  const paymentQuery = `
    SELECT p.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', pp.id,
                 'paymentId', pp.payment_id,
                 'fileName', pp.file_name,
                 'fileType', pp.file_type,
                 'fileSize', pp.file_size,
                 'cloudinaryUrl', pp.cloudinary_url,
                 'cloudinaryPublicId', pp.cloudinary_public_id,
                 'uploadedAt', pp.uploaded_at
               )
             ) FILTER (WHERE pp.id IS NOT NULL),
             '[]'::json
           ) as proofs
    FROM payments p
    LEFT JOIN payment_proofs pp ON p.id = pp.payment_id
    WHERE p.id = $1
    GROUP BY p.id
  `;

  const result = await query(paymentQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    orderId: row.order_id,
    amount: parseFloat(row.amount),
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id,
    rejectionReason: row.rejection_reason,
    reconciledBy: row.reconciled_by,
    reconciledAt: row.reconciled_at,
    proofs: row.proofs || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get payment by order ID
export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const paymentQuery = `
    SELECT p.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', pp.id,
                 'paymentId', pp.payment_id,
                 'fileName', pp.file_name,
                 'fileType', pp.file_type,
                 'fileSize', pp.file_size,
                 'cloudinaryUrl', pp.cloudinary_url,
                 'cloudinaryPublicId', pp.cloudinary_public_id,
                 'uploadedAt', pp.uploaded_at
               )
             ) FILTER (WHERE pp.id IS NOT NULL),
             '[]'::json
           ) as proofs
    FROM payments p
    LEFT JOIN payment_proofs pp ON p.id = pp.payment_id
    WHERE p.order_id = $1
    GROUP BY p.id
  `;

  const result = await query(paymentQuery, [orderId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    orderId: row.order_id,
    amount: parseFloat(row.amount),
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id,
    rejectionReason: row.rejection_reason,
    reconciledBy: row.reconciled_by,
    reconciledAt: row.reconciled_at,
    proofs: row.proofs || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Update payment status
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<Payment | null> {
  return await transaction(async (client) => {
    const updateQuery = `
      UPDATE payments 
      SET status = $2, transaction_id = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [paymentId, status, transactionId || null]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Get proofs
    const proofsQuery = `
      SELECT * FROM payment_proofs WHERE payment_id = $1
    `;
    const proofsResult = await client.query(proofsQuery, [paymentId]);

    return {
      id: row.id,
      orderId: row.order_id,
      amount: parseFloat(row.amount),
      method: row.method,
      status: row.status,
      transactionId: row.transaction_id,
      rejectionReason: row.rejection_reason,
      reconciledBy: row.reconciled_by,
      reconciledAt: row.reconciled_at,
      proofs: proofsResult.rows.map((p: any) => ({
        id: p.id,
        paymentId: p.payment_id,
        fileName: p.file_name,
        fileType: p.file_type,
        fileSize: p.file_size,
        cloudinaryUrl: p.cloudinary_url,
        cloudinaryPublicId: p.cloudinary_public_id,
        uploadedAt: p.uploaded_at,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

// Add payment proof
export async function addPaymentProof(
  paymentId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  cloudinaryUrl: string,
  cloudinaryPublicId: string
): Promise<PaymentProof> {
  const proofQuery = `
    INSERT INTO payment_proofs (payment_id, file_name, file_type, file_size, cloudinary_url, cloudinary_public_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await query(proofQuery, [
    paymentId,
    fileName,
    fileType,
    fileSize,
    cloudinaryUrl,
    cloudinaryPublicId,
  ]);

  const row = result.rows[0];

  return {
    id: row.id,
    paymentId: row.payment_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    cloudinaryUrl: row.cloudinary_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    uploadedAt: row.uploaded_at,
  };
}

// Delete payment proof
export async function deletePaymentProof(proofId: string): Promise<boolean> {
  const deleteQuery = `
    DELETE FROM payment_proofs WHERE id = $1
  `;

  const result = await query(deleteQuery, [proofId]);
  return (result.rowCount ?? 0) > 0;
}

// Get all payment proofs for a payment
export async function getPaymentProofs(paymentId: string): Promise<PaymentProof[]> {
  const proofsQuery = `
    SELECT * FROM payment_proofs WHERE payment_id = $1 ORDER BY uploaded_at DESC
  `;

  const result = await query(proofsQuery, [paymentId]);

  return result.rows.map(row => ({
    id: row.id,
    paymentId: row.payment_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    cloudinaryUrl: row.cloudinary_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    uploadedAt: row.uploaded_at,
  }));
}

// Reconcile payment (mark as received or reconciled)
export async function reconcilePayment(
  paymentId: string,
  status: 'received' | 'reconciled' | 'rejected',
  adminId?: string,
  rejectionReason?: string
): Promise<Payment | null> {
  return await transaction(async (client) => {
    const updateQuery = `
      UPDATE payments 
      SET status = $2, reconciled_by = $3, reconciled_at = NOW(), rejection_reason = $4, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      paymentId,
      status,
      adminId || null,
      rejectionReason || null,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // If reconciled, update order status
    if (status === 'reconciled') {
      const orderUpdateQuery = `
        UPDATE orders 
        SET payment_status = 'reconciled', order_status = 'payment-received', updated_at = NOW()
        WHERE id = $1
      `;

      await client.query(orderUpdateQuery, [row.order_id]);

      // Add timeline event
      const timelineQuery = `
        INSERT INTO order_timeline (order_id, status, description, actor_id)
        VALUES ($1, $2, $3, $4)
      `;

      await client.query(timelineQuery, [
        row.order_id,
        'payment-received',
        'Payment reconciled and confirmed',
        adminId,
      ]);
    }

    // Get proofs
    const proofsQuery = `
      SELECT * FROM payment_proofs WHERE payment_id = $1
    `;
    const proofsResult = await client.query(proofsQuery, [paymentId]);

    return {
      id: row.id,
      orderId: row.order_id,
      amount: parseFloat(row.amount),
      method: row.method,
      status: row.status,
      transactionId: row.transaction_id,
      rejectionReason: row.rejection_reason,
      reconciledBy: row.reconciled_by,
      reconciledAt: row.reconciled_at,
      proofs: proofsResult.rows.map((p: any) => ({
        id: p.id,
        paymentId: p.payment_id,
        fileName: p.file_name,
        fileType: p.file_type,
        fileSize: p.file_size,
        cloudinaryUrl: p.cloudinary_url,
        cloudinaryPublicId: p.cloudinary_public_id,
        uploadedAt: p.uploaded_at,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}
