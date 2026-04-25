'use client';

import { useEffect, useState, useCallback } from 'react';
import { InventoryHealthWidget } from '@/components/admin/InventoryHealthWidget';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api/auth-client';
import {
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  Download,
  BookOpen,
  CheckCircle,
  Circle,
} from 'lucide-react';

interface DashboardData {
  kpis: {
    outstandingTransfers: number;
    pendingReconciliations: number;
    activeSourcingRequests: number;
    dailyTransactionVolume: number;
    ledgerHealthScore: number;
  };
  inventoryHealth: {
    healthScore: number;
    lowStockItems: Array<{
      id: string;
      name: string;
      stockLevel: number;
      category: string;
      price: number;
    }>;
    outOfStockItems: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
    }>;
    totalProducts: number;
    healthyProducts: number;
  };
  openRequests: Array<{
    id: string;
    itemDescription: string;
    quantity: number;
    buyerName: string;
    submissionDate: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    ref: string;
    buyer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  priorityTasks: Array<{
    id: number;
    label: string;
    done: boolean;
    urgent: boolean;
  }>;
}

const statusBadge: Record<string, string> = {
  reconciled: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  received: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  'pending-reconciliation': 'bg-yellow-100 text-yellow-700',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authFetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchDashboardData();
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `KES ${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `KES ${(value / 1_000).toFixed(0)}k`;
    return `KES ${value}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 0)
      return (
        'Today, ' +
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    if (diffDays === 1)
      return (
        'Yesterday, ' +
        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Operations Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, Admin. Here is what needs your attention today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => (window.location.href = '/admin/ledger')}
          >
            <BookOpen className="w-4 h-4" />
            Reconciliation Ledger
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900 text-sm">
              Error loading dashboard
            </p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Outstanding Bank Transfers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Outstanding Bank Transfers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(data?.kpis.outstandingTransfers || 0)}
            </p>
          )}
          {!isLoading && data && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">
                From pending orders
              </span>
            </div>
          )}
        </div>

        {/* Pending Reconciliations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Reconciliations
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">
              {data?.kpis.pendingReconciliations ?? 0}
            </p>
          )}
          {!isLoading && data && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">Awaiting review</span>
            </div>
          )}
        </div>

        {/* Active Sourcing Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Sourcing Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-1/2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">
              {data?.kpis.activeSourcingRequests ?? 0}
            </p>
          )}
          {!isLoading && data && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">Open requests</span>
            </div>
          )}
        </div>

        {/* Daily Gross Volume */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Daily Gross Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(data?.kpis.dailyTransactionVolume || 0)}
            </p>
          )}
          {!isLoading && data && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-slate-400">
                Today&apos;s transactions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Open Sourcing Requests table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Open Sourcing Requests
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 text-xs"
              onClick={() => (window.location.href = '/admin/sourcing')}
            >
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Client / ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-5 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : data?.openRequests && data.openRequests.length > 0 ? (
                  data.openRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {req.buyerName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {req.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {req.quantity} units
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            req.status === 'submitted'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 text-xs h-7 px-2"
                          onClick={() =>
                            (window.location.href = `/admin/sourcing/${req.id}`)
                          }
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-slate-400 text-sm"
                    >
                      No open sourcing requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Inventory Health + Priority Tasks */}
        <div className="space-y-4">
          {/* Inventory Health */}
          <InventoryHealthWidget
            healthScore={data?.inventoryHealth.healthScore || 0}
            lowStockItems={data?.inventoryHealth.lowStockItems || []}
            outOfStockItems={data?.inventoryHealth.outOfStockItems || []}
            totalProducts={data?.inventoryHealth.totalProducts || 0}
            healthyProducts={data?.inventoryHealth.healthyProducts || 0}
            isLoading={isLoading}
            onViewDetails={() => {
              window.location.href = '/admin/inventory';
            }}
          />

          {/* Priority Tasks */}
          <div className="bg-slate-800 rounded-xl p-5 text-white">
            <h3 className="font-semibold text-sm mb-3 text-slate-200">
              Priority Tasks
            </h3>
            {isLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-5 bg-slate-700 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : data?.priorityTasks && data.priorityTasks.length > 0 ? (
              <ul className="space-y-2.5">
                {data.priorityTasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2.5">
                    {task.done ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${task.urgent ? 'text-red-400' : 'text-slate-400'}`}
                      />
                    )}
                    <span
                      className={`text-xs leading-relaxed ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}
                    >
                      {task.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                No priority tasks at the moment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reconciliation Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs"
            onClick={() => (window.location.href = '/admin/orders')}
          >
            View All Orders
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Buyer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-5 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">
                      {item.ref}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.buyer}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge[item.status] || 'bg-slate-100 text-slate-600'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(item.date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400 text-sm"
                  >
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
