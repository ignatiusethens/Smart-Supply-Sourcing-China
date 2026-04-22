'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-client';

interface ReconciliationStatsData {
  stats: {
    totalPayments: number;
    reconciledPayments: number;
    pendingPayments: number;
    receivedPayments: number;
    rejectedPayments: number;
    averageReconciliationTime: number;
  };
  outstandingBalance: number;
  pendingReconciliation: number;
}

interface ReconciliationStatsProps {
  isLoading?: boolean;
}

export function ReconciliationStats({
  isLoading = false,
}: ReconciliationStatsProps) {
  const [data, setData] = useState<ReconciliationStatsData | null>(null);
  const [loading, setLoading] = useState(isLoading);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/api/admin/reconciliation/stats');
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          console.error('Failed to fetch stats:', result.error);
        }
      } catch (error) {
        console.error('Error fetching reconciliation stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const reconciliationRate = data
    ? Math.round(
        (data.stats.reconciledPayments / data.stats.totalPayments) * 100
      ) || 0
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-lg h-32 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load reconciliation statistics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Outstanding Balance</h3>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.outstandingBalance)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Total amount owed</p>
        </div>

        {/* Pending Reconciliation */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">
              Pending Reconciliation
            </h3>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.pendingReconciliation)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Awaiting verification</p>
        </div>

        {/* Reconciliation Rate */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Reconciliation Rate</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {reconciliationRate}%
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {data.stats.reconciledPayments} of {data.stats.totalPayments}{' '}
            payments
          </p>
        </div>

        {/* Avg Reconciliation Time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Avg Time</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.stats.averageReconciliationTime}h
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Average reconciliation time
          </p>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Reconciled */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">
              {data.stats.reconciledPayments}
            </p>
            <p className="text-xs text-green-700 mt-1">Reconciled</p>
          </div>

          {/* Received */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">
              {data.stats.receivedPayments}
            </p>
            <p className="text-xs text-blue-700 mt-1">Received</p>
          </div>

          {/* Pending */}
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">
              {data.stats.pendingPayments}
            </p>
            <p className="text-xs text-yellow-700 mt-1">Pending</p>
          </div>

          {/* Rejected */}
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">
              {data.stats.rejectedPayments}
            </p>
            <p className="text-xs text-red-700 mt-1">Rejected</p>
          </div>

          {/* Total */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-6 h-6 text-gray-600 mx-auto mb-2 font-bold text-lg">
              ∑
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.totalPayments}
            </p>
            <p className="text-xs text-gray-700 mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Health Indicator */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reconciliation Health
        </h3>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Reconciliation Progress
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {reconciliationRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${reconciliationRate}%` }}
              ></div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {reconciliationRate >= 80
                  ? 'Excellent'
                  : reconciliationRate >= 60
                    ? 'Good'
                    : 'Needs Attention'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {data.stats.averageReconciliationTime <= 24
                  ? 'Fast Processing'
                  : 'Standard Processing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
