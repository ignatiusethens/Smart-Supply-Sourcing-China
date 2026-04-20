'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardKPICard } from '@/components/admin/DashboardKPICard';
import { InventoryHealthWidget } from '@/components/admin/InventoryHealthWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  RefreshCw,
  AlertCircle,
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, fetchDashboardData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Operations Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor platform metrics and inventory health
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Last updated: {formatTime(lastUpdated)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={autoRefreshEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            >
              {autoRefreshEnabled ? 'Auto-refresh On' : 'Auto-refresh Off'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <DashboardKPICard
            title="Outstanding Transfers"
            value={data?.kpis.outstandingTransfers || 0}
            unit="KES"
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            isLoading={isLoading}
            description="Bank transfers pending reconciliation"
            variant={
              (data?.kpis.outstandingTransfers || 0) > 500000
                ? 'warning'
                : 'default'
            }
          />

          <DashboardKPICard
            title="Pending Reconciliations"
            value={data?.kpis.pendingReconciliations || 0}
            unit="payments"
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            isLoading={isLoading}
            description="Awaiting admin verification"
            variant={
              (data?.kpis.pendingReconciliations || 0) > 5
                ? 'warning'
                : 'default'
            }
          />

          <DashboardKPICard
            title="Active Sourcing Requests"
            value={data?.kpis.activeSourcingRequests || 0}
            unit="requests"
            icon={<FileText className="h-6 w-6 text-purple-600" />}
            isLoading={isLoading}
            description="Submitted and under review"
          />

          <DashboardKPICard
            title="Daily Transaction Volume"
            value={data?.kpis.dailyTransactionVolume || 0}
            unit="KES"
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            isLoading={isLoading}
            description="Today's completed transactions"
            variant="success"
          />

          <DashboardKPICard
            title="Ledger Health Score"
            value={`${data?.kpis.ledgerHealthScore || 0}%`}
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            isLoading={isLoading}
            description="Payment reconciliation rate"
            variant={
              (data?.kpis.ledgerHealthScore || 0) >= 80
                ? 'success'
                : 'warning'
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Health Widget */}
          <div className="lg:col-span-1">
            <InventoryHealthWidget
              healthScore={data?.inventoryHealth.healthScore || 0}
              lowStockItems={data?.inventoryHealth.lowStockItems || []}
              outOfStockItems={data?.inventoryHealth.outOfStockItems || []}
              totalProducts={data?.inventoryHealth.totalProducts || 0}
              healthyProducts={data?.inventoryHealth.healthyProducts || 0}
              isLoading={isLoading}
              onViewDetails={() => {
                // Navigate to inventory report
                window.location.href = '/admin/inventory';
              }}
            />
          </div>

          {/* Open Sourcing Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Open Sourcing Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : data?.openRequests && data.openRequests.length > 0 ? (
                  <div className="space-y-3">
                    {data.openRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {request.itemDescription}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {request.quantity} • Buyer: {request.buyerName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted:{' '}
                              {new Date(request.submissionDate).toLocaleDateString(
                                'en-KE'
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No open sourcing requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
