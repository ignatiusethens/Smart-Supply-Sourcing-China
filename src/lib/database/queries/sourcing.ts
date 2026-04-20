import { query, transaction } from '../connection';
import { SourcingRequest, SourcingAttachment, CreateSourcingRequestRequest } from '@/types';

// Create a new sourcing request
export async function createSourcingRequest(
  buyerId: string,
  data: CreateSourcingRequestRequest,
  attachmentUrls: Array<{ fileName: string; fileType: string; fileSize: number; cloudinaryUrl: string; cloudinaryPublicId: string }>
): Promise<SourcingRequest> {
  return transaction(async (client) => {
    // Insert sourcing request
    const requestQuery = `
      INSERT INTO sourcing_requests (
        buyer_id, item_description, specifications, quantity, target_price,
        delivery_location, timeline, compliance_requirements, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const requestResult = await client.query(requestQuery, [
      buyerId,
      data.itemDescription,
      data.specifications || null,
      data.quantity,
      data.targetPrice || null,
      data.deliveryLocation,
      data.timeline || null,
      data.complianceRequirements || null,
      'submitted',
    ]);

    const sourcingRequest = requestResult.rows[0];

    // Insert attachments if any
    if (attachmentUrls && attachmentUrls.length > 0) {
      for (const attachment of attachmentUrls) {
        await client.query(
          `
          INSERT INTO sourcing_attachments (
            sourcing_request_id, file_name, file_type, file_size,
            cloudinary_url, cloudinary_public_id
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            sourcingRequest.id,
            attachment.fileName,
            attachment.fileType,
            attachment.fileSize,
            attachment.cloudinaryUrl,
            attachment.cloudinaryPublicId,
          ]
        );
      }
    }

    return {
      id: sourcingRequest.id,
      buyerId: sourcingRequest.buyer_id,
      itemDescription: sourcingRequest.item_description,
      specifications: sourcingRequest.specifications,
      quantity: sourcingRequest.quantity,
      targetPrice: sourcingRequest.target_price ? parseFloat(sourcingRequest.target_price) : undefined,
      deliveryLocation: sourcingRequest.delivery_location,
      timeline: sourcingRequest.timeline,
      complianceRequirements: sourcingRequest.compliance_requirements,
      status: sourcingRequest.status,
      adminNotes: sourcingRequest.admin_notes,
      attachments: attachmentUrls.map((att, index) => ({
        id: `att-${sourcingRequest.id}-${index}`,
        sourcingRequestId: sourcingRequest.id,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        cloudinaryUrl: att.cloudinaryUrl,
        cloudinaryPublicId: att.cloudinaryPublicId,
        uploadedAt: new Date().toISOString(),
      })),
      quotes: [],
      createdAt: sourcingRequest.created_at,
      updatedAt: sourcingRequest.updated_at,
    };
  });
}

// Get sourcing request by ID
export async function getSourcingRequestById(id: string): Promise<SourcingRequest | null> {
  const requestQuery = `
    SELECT 
      sr.*,
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
            'id', sa.id,
            'sourcingRequestId', sa.sourcing_request_id,
            'fileName', sa.file_name,
            'fileType', sa.file_type,
            'fileSize', sa.file_size,
            'cloudinaryUrl', sa.cloudinary_url,
            'cloudinaryPublicId', sa.cloudinary_public_id,
            'uploadedAt', sa.uploaded_at
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'::json
      ) as attachments
    FROM sourcing_requests sr
    LEFT JOIN users u ON sr.buyer_id = u.id
    LEFT JOIN sourcing_attachments sa ON sr.id = sa.sourcing_request_id
    WHERE sr.id = $1
    GROUP BY sr.id, u.id
  `;

  const result = await query(requestQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    itemDescription: row.item_description,
    specifications: row.specifications,
    quantity: row.quantity,
    targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
    deliveryLocation: row.delivery_location,
    timeline: row.timeline,
    complianceRequirements: row.compliance_requirements,
    status: row.status,
    adminNotes: row.admin_notes,
    attachments: row.attachments || [],
    quotes: [], // Will be loaded separately if needed
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get sourcing requests for a buyer
export async function getBuyerSourcingRequests(buyerId: string): Promise<SourcingRequest[]> {
  const requestsQuery = `
    SELECT 
      sr.*,
      COALESCE(
        json_agg(
          DISTINCT json_build_object(
            'id', sa.id,
            'sourcingRequestId', sa.sourcing_request_id,
            'fileName', sa.file_name,
            'fileType', sa.file_type,
            'fileSize', sa.file_size,
            'cloudinaryUrl', sa.cloudinary_url,
            'cloudinaryPublicId', sa.cloudinary_public_id,
            'uploadedAt', sa.uploaded_at
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'::json
      ) as attachments
    FROM sourcing_requests sr
    LEFT JOIN sourcing_attachments sa ON sr.id = sa.sourcing_request_id
    WHERE sr.buyer_id = $1
    GROUP BY sr.id
    ORDER BY sr.created_at DESC
  `;

  const result = await query(requestsQuery, [buyerId]);

  return result.rows.map((row) => ({
    id: row.id,
    buyerId: row.buyer_id,
    itemDescription: row.item_description,
    specifications: row.specifications,
    quantity: row.quantity,
    targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
    deliveryLocation: row.delivery_location,
    timeline: row.timeline,
    complianceRequirements: row.compliance_requirements,
    status: row.status,
    adminNotes: row.admin_notes,
    attachments: row.attachments || [],
    quotes: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Get all sourcing requests (for admin)
export async function getAllSourcingRequests(
  status?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ requests: SourcingRequest[]; total: number }> {
  const offset = (page - 1) * limit;

  let countQuery = 'SELECT COUNT(*) as total FROM sourcing_requests';
  let requestsQuery = `
    SELECT 
      sr.*,
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
            'id', sa.id,
            'sourcingRequestId', sa.sourcing_request_id,
            'fileName', sa.file_name,
            'fileType', sa.file_type,
            'fileSize', sa.file_size,
            'cloudinaryUrl', sa.cloudinary_url,
            'cloudinaryPublicId', sa.cloudinary_public_id,
            'uploadedAt', sa.uploaded_at
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'::json
      ) as attachments
    FROM sourcing_requests sr
    LEFT JOIN users u ON sr.buyer_id = u.id
    LEFT JOIN sourcing_attachments sa ON sr.id = sa.sourcing_request_id
  `;

  const params: any[] = [];

  if (status) {
    countQuery += ' WHERE status = $1';
    requestsQuery += ' WHERE sr.status = $1';
    params.push(status);
  }

  requestsQuery += ' GROUP BY sr.id, u.id ORDER BY sr.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);

  const countResult = await query(countQuery, status ? [status] : []);
  const total = parseInt(countResult.rows[0].total);

  const result = await query(requestsQuery, params);

  const requests = result.rows.map((row) => ({
    id: row.id,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    itemDescription: row.item_description,
    specifications: row.specifications,
    quantity: row.quantity,
    targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
    deliveryLocation: row.delivery_location,
    timeline: row.timeline,
    complianceRequirements: row.compliance_requirements,
    status: row.status,
    adminNotes: row.admin_notes,
    attachments: row.attachments || [],
    quotes: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { requests, total };
}

// Update sourcing request status
export async function updateSourcingRequestStatus(id: string, status: string, adminNotes?: string): Promise<SourcingRequest | null> {
  const updateQuery = `
    UPDATE sourcing_requests
    SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await query(updateQuery, [status, adminNotes || null, id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    buyerId: row.buyer_id,
    itemDescription: row.item_description,
    specifications: row.specifications,
    quantity: row.quantity,
    targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
    deliveryLocation: row.delivery_location,
    timeline: row.timeline,
    complianceRequirements: row.compliance_requirements,
    status: row.status,
    adminNotes: row.admin_notes,
    attachments: [],
    quotes: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get sourcing request with full details including quotes
export async function getSourcingRequestWithQuotes(id: string): Promise<SourcingRequest | null> {
  const requestQuery = `
    SELECT 
      sr.*,
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
            'id', sa.id,
            'sourcingRequestId', sa.sourcing_request_id,
            'fileName', sa.file_name,
            'fileType', sa.file_type,
            'fileSize', sa.file_size,
            'cloudinaryUrl', sa.cloudinary_url,
            'cloudinaryPublicId', sa.cloudinary_public_id,
            'uploadedAt', sa.uploaded_at
          )
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'::json
      ) as attachments
    FROM sourcing_requests sr
    LEFT JOIN users u ON sr.buyer_id = u.id
    LEFT JOIN sourcing_attachments sa ON sr.id = sa.sourcing_request_id
    WHERE sr.id = $1
    GROUP BY sr.id, u.id
  `;

  const result = await query(requestQuery, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  // Get quotes for this sourcing request
  const quotesQuery = `
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
      ) as line_items
    FROM quotes q
    LEFT JOIN quote_line_items qli ON q.id = qli.quote_id
    WHERE q.sourcing_request_id = $1
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `;

  const quotesResult = await query(quotesQuery, [id]);

  return {
    id: row.id,
    buyerId: row.buyer_id,
    buyer: row.buyer,
    itemDescription: row.item_description,
    specifications: row.specifications,
    quantity: row.quantity,
    targetPrice: row.target_price ? parseFloat(row.target_price) : undefined,
    deliveryLocation: row.delivery_location,
    timeline: row.timeline,
    complianceRequirements: row.compliance_requirements,
    status: row.status,
    adminNotes: row.admin_notes,
    attachments: row.attachments || [],
    quotes: quotesResult.rows.map((q: any) => ({
      id: q.id,
      sourcingRequestId: q.sourcing_request_id,
      buyerId: q.buyer_id,
      totalAmount: parseFloat(q.total_amount),
      validUntil: q.valid_until,
      status: q.status,
      orderId: q.order_id,
      lineItems: q.line_items.map((li: any) => ({
        id: li.id,
        quoteId: li.quoteId,
        description: li.description,
        specifications: li.specifications,
        quantity: li.quantity,
        unitPrice: parseFloat(li.unitPrice),
        subtotal: parseFloat(li.subtotal),
      })),
      createdAt: q.created_at,
      acceptedAt: q.accepted_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
