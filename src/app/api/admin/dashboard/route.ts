import { NextRequest, NextResponse } from 'next/server';
import { getDashboardKPIs, getInventoryHealth, getOpenSourcingRequests } from '@/lib/database/queries/admin';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  // Require admin authentication
  const auth = await requireAdmin(request);
  if (!auth.success) {
    return auth.response;
  }

  try {
    const [kpis, inventoryHealth, openRequests] = await Promise.all([
      getDashboardKPIs(),
      getInventoryHealth(),
      getOpenSourcingRequests(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        inventoryHealth,
        openRequests,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}
