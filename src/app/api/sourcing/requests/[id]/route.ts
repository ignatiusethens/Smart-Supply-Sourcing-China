import { NextRequest, NextResponse } from 'next/server';
import {
  getSourcingRequestWithQuotes,
  updateSourcingRequestStatus,
} from '@/lib/database/queries/sourcing';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow both admin and buyer to fetch (buyer needs to see their own request)
  try {
    const { id } = await params;

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Invalid sourcing request ID' },
        { status: 400 }
      );
    }

    const sourcingRequest = await getSourcingRequestWithQuotes(id);

    if (!sourcingRequest) {
      return NextResponse.json(
        { success: false, error: 'Sourcing request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: sourcingRequest });
  } catch (error) {
    console.error('Error fetching sourcing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sourcing request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required',
        },
        { status: 400 }
      );
    }

    const updated = await updateSourcingRequestStatus(id, status, adminNotes);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sourcing request not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating sourcing request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update sourcing request',
      },
      { status: 500 }
    );
  }
}
