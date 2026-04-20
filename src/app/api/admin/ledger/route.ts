import { NextRequest, NextResponse } from 'next/server';
import { getPaymentReconciliationLedger } from '@/lib/database/queries/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const statusesParam = searchParams.get('statuses');
    const searchQuery = searchParams.get('search') || '';

    const statuses = statusesParam ? statusesParam.split(',') : [];

    const result = await getPaymentReconciliationLedger({
      statuses: statuses.length > 0 ? statuses : undefined,
      searchQuery,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment reconciliation ledger',
      },
      { status: 500 }
    );
  }
}
