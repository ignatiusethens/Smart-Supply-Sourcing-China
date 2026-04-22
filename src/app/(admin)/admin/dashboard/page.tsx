'use client';

import { useEffect, useState, useCallback } from 'react';
import { InventoryHealthWidget } from '@/components/admin/InventoryHealthWidget';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
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
}

const priorityTasks = [
  {
    id: 1,
    label: 'Reconcile 3 pending bank transfers',
    done: false,
    urgent: true,
  },
  {
    id: 2,
    label: 'Review 2 new sourcing requests',
    done: false,
    urgent: false,
  },
  {
    id: 3,
    label: 'Update inventory for low-stock items',
    done: true,
    urgent: false,
  },
  {
    id: 4,
    label: 'Export monthly reconciliation report',
    done: false,
    urgent: false,
  },
];

const recentActivity = [
  {
    id: 1,
    ref: 'TXN-2024-001',
    buyer: 'Acme Corp',
    amount: 'KES 245,000',
    status: 'reconciled',
    date: 'Today, 09:14',
  },
  {
    id: 2,
    ref: 'TXN-2024-002',
    buyer: 'BuildRight Ltd',
    amount: 'KES 88,500',
    status: 'pending',
    date: 'Today, 08:52',
  },
  {
    id: 3,
    ref: 'TXN-2024-003',
    buyer: 'TechPro Kenya',
    amount: 'KES 1,200,000',
    status: 'received',
    date: 'Yesterday, 16:30',
  },
];

const statusBadge: Record<string, string> = {
  reconciled: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  received: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/dashboard');
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    void fetchDashboardData();
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
              {formatCurrency(data?.kpis.outstandingTransfers || 1420000)}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">+12.5%</span>
            <span className="text-xs text-slate-400 ml-1">vs last week</span>
          </div>
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
              {data?.kpis.pendingReconciliations ?? 18}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600 font-medium">-4.2%</span>
            <span className="text-xs text-slate-400 ml-1">vs last week</span>
          </div>
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
              {data?.kpis.activeSourcingRequests ?? 42}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">+8.1%</span>
            <span className="text-xs text-slate-400 ml-1">vs last week</span>
          </div>
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
              {formatCurrency(data?.kpis.dailyTransactionVolume || 840000)}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">+2.4%</span>
            <span className="text-xs text-slate-400 ml-1">vs yesterday</span>
          </div>
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
            <ul className="space-y-2.5">
              {priorityTasks.map((task) => (
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
          </div>
        </div>
      </div>

      {/* Recent Reconciliation Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent Reconciliation Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs"
            onClick={() => (window.location.href = '/admin/ledger')}
          >
            View Ledger
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
              {recentActivity.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">
                    {item.ref}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.buyer}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge[item.status] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
