import { NextRequest, NextResponse } from 'next/server';
import { getInventoryHealth, getDetailedInventoryReport } from '@/lib/database/queries/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const [health, report] = await Promise.all([
      getInventoryHealth(),
      getDetailedInventoryReport(page, limit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        health,
        report,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory data',
      },
      { status: 500 }
    );
  }
}
