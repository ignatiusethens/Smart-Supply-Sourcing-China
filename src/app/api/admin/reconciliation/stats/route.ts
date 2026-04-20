import { NextRequest, NextResponse } from 'next/server';
import {
  getReconciliationStats,
  getOutstandingBalance,
  getPendingReconciliationAmount,
} from '@/lib/database/queries/admin';

export async function GET(request: NextRequest) {
  try {
    const [stats, outstandingBalance, pendingReconciliation] = await Promise.all([
      getReconciliationStats(),
      getOutstandingBalance(),
      getPendingReconciliationAmount(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        outstandingBalance,
        pendingReconciliation,
      },
    });
  } catch (error) {
    console.error('Error fetching reconciliation stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reconciliation statistics',
      },
      { status: 500 }
    );
  }
}
