import { NextRequest, NextResponse } from 'next/server';
import { getAllSourcingRequests } from '@/lib/database/queries/sourcing';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const result = await getAllSourcingRequests(status || undefined, page, limit);

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
      {
        success: false,
        error: 'Failed to fetch sourcing requests',
      },
      { status: 500 }
    );
  }
}
