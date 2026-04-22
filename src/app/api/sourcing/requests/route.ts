import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSourcingRequests,
  createSourcingRequest,
} from '@/lib/database/queries/sourcing';
import { requireAuth } from '@/lib/auth/middleware';

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
  // Require authentication
  const auth = await requireAuth(request);
  if (!auth.success) {
    return auth.response;
  }

  try {
    const formData = await request.formData();

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

    // Always use the authenticated user's ID from the JWT token
    const resolvedBuyerId = auth.user.id;

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
      []
    );

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
