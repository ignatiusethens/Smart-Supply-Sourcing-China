'use client';

import { formatCurrency } from '@/lib/utils/formatting';

interface DashboardSummaryProps {
  outstandingBalance: number;
  pendingReconciliation: number;
  totalOrders: number;
  completedOrders: number;
}

export function DashboardSummary({
  outstandingBalance,
  pendingReconciliation,
  totalOrders,
  completedOrders,
}: DashboardSummaryProps) {
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Outstanding Balance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
            Outstanding Balance
          </p>
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">💰</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(outstandingBalance)}
        </p>
        <p className="text-xs text-gray-500 mt-2">Amount owed across all orders</p>
      </div>

      {/* Pending Reconciliation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
            Pending Reconciliation
          </p>
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">⏳</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(pendingReconciliation)}
        </p>
        <p className="text-xs text-gray-500 mt-2">Awaiting verification</p>
      </div>

      {/* Total Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
            Total Orders
          </p>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">📦</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        <p className="text-xs text-gray-500 mt-2">All time orders</p>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">
            Completion Rate
          </p>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">✓</span>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
        <p className="text-xs text-gray-500 mt-2">
          {completedOrders} of {totalOrders} completed
        </p>
      </div>
    </div>
  );
}
