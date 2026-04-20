import { query, transaction } from '../connection';
import { Invoice, InvoiceLineItem, InvoiceVerificationFile } from '@/types';

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
  const countQuery = `
    SELECT COUNT(*) as count
    FROM invoices
    WHERE invoice_number LIKE $1
  `;

  const result = await query(countQuery, [`${datePrefix}%`]);
  const count = parseInt(result.rows[0].count) + 1;
  const paddedCount = String(count).padStart(4, '0');

  return `INV-${datePrefix}-${paddedCount}`;
}

// Create a new invoice
export async function createInvoice(
  buyerId: string,
  data: {
    sourcingRequestId?: string;
    quoteId?: string;
    orderId?: string;
    lineItems: Array<{
      description: string;
      specifications?: string;
      quantity: number;
      unitPrice: number;
    }>;
    subtotal: number;
    taxAmount?: number;
    totalAmount: number;
    termsAndConditions?: string;
    paymentInstructions?: string;
    settlementInstructions?: string;
  }
): Promise<Invoice> {
  return transaction(async (client) => {
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Insert invoice
    const invoiceQuery = `
      INSERT INTO invoices (
        buyer_id, sourcing_request_id, quote_id, order_id, invoice_number,
        status, subtotal, tax_amount, total_amount,
        terms_and_conditions, payment_instructions, settlement_instructions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const invoiceResult = await client.query(invoiceQuery, [
      buyerId,
      data.sourcingRequestId || null,
      data.quoteId || null,
      data.orderId || null,
      invoiceNumber,
      'draft',
      data.subtotal,
      data.taxAmount || 0,
      data.totalAmount,
      data.termsAndConditions || null,
      data.paymentInstructions || null,
      data.settlementInstructions || null,
    ]);

    const invoice = invoiceResult.rows[0];

    // Insert line items
    const lineItems: InvoiceLineItem[] = [];
    for (const item of data.lineItems) {
      const lineItemQuery = `
        INSERT INTO invoice_line_items (
          invoice_id, description, specifications, quantity, unit_price, subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const lineItemResult = await client.query(lineItemQuery, [
        invoice.id,
        item.description,
        item.specifications || null,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice,
      ]);

      const lineItem = lineItemResult.rows[0];
      lineItems.push({
        id: lineItem.id,
        invoiceId: lineItem.invoice_id,
        description: lineItem.description,
        specifications: lineItem.specifications,
        quantity: lineItem.quantity,
        unitPrice: parseFloat(lineItem.unit_price),
        subtotal: parseFloat(lineItem.subtotal),
      });
    }

    return {
      id: invoice.id,
      sourcingRequestId: invoice.sourcing_request_id,
      quoteId: invoice.quote_id,
      orderId: invoice.order_id,
      buyerId: invoice.buyer_id,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      subtotal: parseFloat(invoice.subtotal),
      taxAmount: parseFloat(invoice.tax_amount),
      totalAmount: parseFloat(invoice.total_amount),
      termsAndConditions: invoice.terms_and_conditions,
      paymentInstructions: invoice.payment_instructions,
      settlementInstructions: invoice.settlement_instructions,
      logisticsNotes: invoice.logistics_notes,
      adminComments: invoice.admin_comments,
      lineItems,
      verificationGallery: [],
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    };
  });
}

// Get invoice by ID
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const invoiceQuery = `
    SELECT 
      i.*,
      json_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'phone', u.phone,
        'companyName', u.company_name,
        'role', u.role
      ) as buyer
    FROM invoices i
    LEFT JOIN users u ON i.buyer_id = u.id
    WHERE i.id = $1
  `;

  const result = await query(invoiceQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  // Get line items
  const lineItemsQuery = `
    SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY created_at ASC
  `;
  const lineItemsResult = await query(lineItemsQuery, [id]);

  // Get verification gallery
  const galleryQuery = `
    SELECT * FROM invoice_verification_gallery WHERE invoice_id = $1 ORDER BY uploaded_at DESC
  `;
  const galleryResult = await query(galleryQuery, [id]);

  return {
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    quoteId: row.quote_id,
    orderId: row.order_id,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    invoiceNumber: row.invoice_number,
    status: row.status,
    subtotal: parseFloat(row.subtotal),
    taxAmount: parseFloat(row.tax_amount),
    totalAmount: parseFloat(row.total_amount),
    termsAndConditions: row.terms_and_conditions,
    paymentInstructions: row.payment_instructions,
    settlementInstructions: row.settlement_instructions,
    logisticsNotes: row.logistics_notes,
    adminComments: row.admin_comments,
    lineItems: lineItemsResult.rows.map((li: any) => ({
      id: li.id,
      invoiceId: li.invoice_id,
      description: li.description,
      specifications: li.specifications,
      quantity: li.quantity,
      unitPrice: parseFloat(li.unit_price),
      subtotal: parseFloat(li.subtotal),
    })),
    verificationGallery: galleryResult.rows.map((g: any) => ({
      id: g.id,
      invoiceId: g.invoice_id,
      fileName: g.file_name,
      fileType: g.file_type,
      fileSize: g.file_size,
      cloudinaryUrl: g.cloudinary_url,
      cloudinaryPublicId: g.cloudinary_public_id,
      uploadedAt: g.uploaded_at,
    })),
    sentAt: row.sent_at,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get invoices for a buyer
export async function getBuyerInvoices(buyerId: string, page: number = 1, limit: number = 20): Promise<{ invoices: Invoice[]; total: number }> {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*) as total FROM invoices WHERE buyer_id = $1
  `;

  const invoicesQuery = `
    SELECT * FROM invoices WHERE buyer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
  `;

  const [countResult, invoicesResult] = await Promise.all([
    query(countQuery, [buyerId]),
    query(invoicesQuery, [buyerId, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0].total);

  const invoices = await Promise.all(
    invoicesResult.rows.map(async (row: any) => {
      const invoice = await getInvoiceById(row.id);
      return invoice!;
    })
  );

  return { invoices, total };
}

// Get invoices for a sourcing request
export async function getSourcingRequestInvoices(sourcingRequestId: string): Promise<Invoice[]> {
  const invoicesQuery = `
    SELECT * FROM invoices WHERE sourcing_request_id = $1 ORDER BY created_at DESC
  `;

  const result = await query(invoicesQuery, [sourcingRequestId]);

  const invoices = await Promise.all(
    result.rows.map(async (row: any) => {
      const invoice = await getInvoiceById(row.id);
      return invoice!;
    })
  );

  return invoices;
}

// Update invoice status
export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'draft' | 'sent' | 'pending-payment' | 'paid' | 'cancelled'
): Promise<Invoice | null> {
  return transaction(async (client) => {
    const updateQuery = `
      UPDATE invoices
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [status, invoiceId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the updated invoice
    const invoice = await getInvoiceById(invoiceId);
    return invoice;
  });
}

// Send invoice to buyer (mark as sent)
export async function sendInvoice(invoiceId: string): Promise<Invoice | null> {
  return transaction(async (client) => {
    const updateQuery = `
      UPDATE invoices
      SET status = 'sent', sent_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [invoiceId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the updated invoice
    const invoice = await getInvoiceById(invoiceId);
    return invoice;
  });
}

// Mark invoice as paid
export async function markInvoiceAsPaid(invoiceId: string): Promise<Invoice | null> {
  return transaction(async (client) => {
    const updateQuery = `
      UPDATE invoices
      SET status = 'paid', paid_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [invoiceId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the updated invoice
    const invoice = await getInvoiceById(invoiceId);
    return invoice;
  });
}

// Add logistics notes to invoice
export async function addLogisticsNotes(invoiceId: string, notes: string): Promise<Invoice | null> {
  return transaction(async (client) => {
    const updateQuery = `
      UPDATE invoices
      SET logistics_notes = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [notes, invoiceId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the updated invoice
    const invoice = await getInvoiceById(invoiceId);
    return invoice;
  });
}

// Add admin comments to invoice
export async function addAdminComments(invoiceId: string, comments: string): Promise<Invoice | null> {
  return transaction(async (client) => {
    const updateQuery = `
      UPDATE invoices
      SET admin_comments = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await client.query(updateQuery, [comments, invoiceId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch the updated invoice
    const invoice = await getInvoiceById(invoiceId);
    return invoice;
  });
}

// Add verification file to invoice
export async function addInvoiceVerificationFile(
  invoiceId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  cloudinaryUrl: string,
  cloudinaryPublicId: string
): Promise<InvoiceVerificationFile> {
  const fileQuery = `
    INSERT INTO invoice_verification_gallery (
      invoice_id, file_name, file_type, file_size, cloudinary_url, cloudinary_public_id
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await query(fileQuery, [
    invoiceId,
    fileName,
    fileType,
    fileSize,
    cloudinaryUrl,
    cloudinaryPublicId,
  ]);

  const row = result.rows[0];

  return {
    id: row.id,
    invoiceId: row.invoice_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    cloudinaryUrl: row.cloudinary_url,
    cloudinaryPublicId: row.cloudinary_public_id,
    uploadedAt: row.uploaded_at,
  };
}

// Delete verification file from invoice
export async function deleteInvoiceVerificationFile(fileId: string): Promise<boolean> {
  const deleteQuery = `
    DELETE FROM invoice_verification_gallery WHERE id = $1
  `;

  const result = await query(deleteQuery, [fileId]);
  return (result.rowCount ?? 0) > 0;
}

// Get all invoices (for admin)
export async function getAllInvoices(
  filters?: {
    status?: string[];
    page?: number;
    limit?: number;
  }
): Promise<{ invoices: Invoice[]; total: number }> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const offset = (page - 1) * limit;
  const statuses = filters?.status || [];

  let whereClause = '1=1';
  const params: any[] = [];

  if (statuses.length > 0) {
    whereClause = `status = ANY($1)`;
    params.push(statuses);
  }

  const countQuery = `
    SELECT COUNT(*) as total FROM invoices WHERE ${whereClause}
  `;

  const invoicesQuery = `
    SELECT * FROM invoices WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${params.length + 1} OFFSET ${params.length + 2}
  `;

  const countParams = [...params];
  const invoicesParams = [...params, limit, offset];

  const [countResult, invoicesResult] = await Promise.all([
    query(countQuery, countParams),
    query(invoicesQuery, invoicesParams),
  ]);

  const total = parseInt(countResult.rows[0].total);

  const invoices = await Promise.all(
    invoicesResult.rows.map(async (row: any) => {
      const invoice = await getInvoiceById(row.id);
      return invoice!;
    })
  );

  return { invoices, total };
}

// Get invoice by invoice number
export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  const invoiceQuery = `
    SELECT id FROM invoices WHERE invoice_number = $1
  `;

  const result = await query(invoiceQuery, [invoiceNumber]);

  if (result.rows.length === 0) {
    return null;
  }

  return getInvoiceById(result.rows[0].id);
}
