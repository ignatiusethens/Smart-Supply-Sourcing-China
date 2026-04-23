import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSourcingRequests,
  createSourcingRequest,
} from '@/lib/database/queries/sourcing';
import { requireAuth } from '@/lib/auth/middleware';
import { sendSourcingRequestNotification } from '@/lib/email/sendEmail';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const result = await getAllSourcingRequests(
      status || undefined,
      page,
      limit
    );

    // Transform to match the frontend expectations
    const transformedRequests = result.requests.map((req) => ({
      id: req.id,
      itemDescription: req.itemDescription,
      quantity: req.quantity,
      buyerName: req.buyer?.name || 'Unknown',
      status: req.status,
      createdAt: req.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedRequests,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sourcing requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sourcing requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Read formData first (body can only be read once)
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid form data' },
      { status: 400 }
    );
  }

  // Authenticate: try Authorization header first, then _token form field
  let authenticatedUser = null;

  // Try header-based auth
  const headerAuth = await requireAuth(request);
  if (headerAuth.success) {
    authenticatedUser = headerAuth.user;
  } else {
    // Fallback: read token from form field
    const tokenFromForm = formData.get('_token') as string | null;
    if (tokenFromForm) {
      try {
        const { verifyToken } = await import('@/lib/auth/jwt');
        const { getPool } = await import('@/lib/database/connection');
        const payload = verifyToken(tokenFromForm);
        if (payload) {
          const pool = getPool();
          const result = await pool.query(
            'SELECT id, email, name, phone, company_name, role, created_at, updated_at FROM users WHERE id = $1',
            [payload.userId]
          );
          if (result.rows.length > 0) {
            const dbUser = result.rows[0];
            authenticatedUser = {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              phone: dbUser.phone,
              companyName: dbUser.company_name,
              role: dbUser.role,
              createdAt: dbUser.created_at,
              updatedAt: dbUser.updated_at,
            };
          }
        }
      } catch {
        // ignore
      }
    }
  }

  if (!authenticatedUser) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const buyerId = formData.get('buyerId') as string;
    const itemDescription = formData.get('itemDescription') as string;
    const specifications = formData.get('specifications') as string;
    const quantityRaw = formData.get('quantity') as string;
    const targetPriceRaw = formData.get('targetPrice') as string;
    const deliveryLocation = formData.get('deliveryLocation') as string;
    const timeline = formData.get('timeline') as string;
    const complianceRequirements = formData.get(
      'complianceRequirements'
    ) as string;

    if (!itemDescription || !quantityRaw) {
      return NextResponse.json(
        { success: false, error: 'Item description and quantity are required' },
        { status: 400 }
      );
    }

    const quantity = parseInt(quantityRaw) || 1;
    const targetPrice = targetPriceRaw ? parseFloat(targetPriceRaw) : undefined;
    const resolvedBuyerId = authenticatedUser.id;

    // Upload attachments to Cloudinary if any
    const attachmentFiles = formData.getAll('attachments') as File[];
    const attachmentUrls: Array<{
      fileName: string;
      fileType: string;
      fileSize: number;
      cloudinaryUrl: string;
      cloudinaryPublicId: string;
    }> = [];

    for (const file of attachmentFiles) {
      if (file && file.size > 0) {
        try {
          const result = await uploadToCloudinary(
            file,
            'smart-supply-sourcing/sourcing'
          );
          attachmentUrls.push({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
          });
        } catch (uploadError) {
          console.error('Failed to upload attachment:', uploadError);
          // Continue without this attachment
        }
      }
    }

    const sourcingRequest = await createSourcingRequest(
      resolvedBuyerId,
      {
        itemDescription,
        specifications: specifications || '',
        quantity,
        targetPrice,
        deliveryLocation: deliveryLocation || '',
        timeline: timeline || '',
        complianceRequirements: complianceRequirements || '',
      },
      attachmentUrls
    );

    // Send email notification to admin (non-blocking)
    void sendSourcingRequestNotification({
      buyerName: authenticatedUser.name,
      buyerEmail: authenticatedUser.email,
      itemDescription,
      quantity,
      deliveryLocation: deliveryLocation || '',
      timeline: timeline || '',
      requestId: sourcingRequest.id,
    });

    return NextResponse.json(
      { success: true, data: sourcingRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sourcing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sourcing request' },
      { status: 500 }
    );
  }
}
