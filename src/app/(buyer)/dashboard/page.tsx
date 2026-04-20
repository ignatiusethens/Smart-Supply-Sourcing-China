'use client';

import { useEffect, useState } from 'react';
import { DashboardSummary } from '@/components/buyer/DashboardSummary';
import { PaymentHistoryTable } from '@/components/buyer/PaymentHistoryTable';
import { InvoiceList } from '@/components/buyer/InvoiceList';
import { TransactionFilter } from '@/components/buyer/TransactionFilter';
import Link from 'next/link';

interface PaymentRecord {
  id: string;
  orderId: string;
  referenceCode: string;
  amount: number;
  method: 'mpesa' | 'bank-transfer';
  status: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  outstandingBalance: number;
  pendingReconciliation: number;
  totalOrders: number;
  completedOrders: number;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices' | 'transactions'>('payments');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';

        // Fetch dashboard summary
        const summaryResponse = await fetch(`/api/orders/dashboard/summary?userId=${userId}`);
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch dashboard summary');
        }

        const summaryData = await summaryResponse.json();
        if (summaryData.success && summaryData.data) {
          setDashboardData(summaryData.data);
        }

        // Fetch payment history
        const paymentsResponse = await fetch(
          `/api/orders/dashboard/payments?userId=${userId}&page=1&limit=10`
        );
        if (!paymentsResponse.ok) {
          throw new Error('Failed to fetch payment history');
        }

        const paymentsData = await paymentsResponse.json();
        if (paymentsData.success && paymentsData.data) {
          setPayments(paymentsData.data.payments || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your account and track payments</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Dashboard Summary */}
        {dashboardData && (
          <div className="mb-12">
            <DashboardSummary
              outstandingBalance={dashboardData.outstandingBalance}
              pendingReconciliation={dashboardData.pendingReconciliation}
              totalOrders={dashboardData.totalOrders}
              completedOrders={dashboardData.completedOrders}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/orders">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All Orders</h3>
                  <p className="text-gray-600 mt-1">Track your orders and payment status</p>
                </div>
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </Link>

          <Link href="/catalog">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Browse Catalog</h3>
                  <p className="text-gray-600 mt-1">Explore more products and place new orders</p>
                </div>
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Account Activity</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'invoices'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions by Status
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'payments' && (
            <PaymentHistoryTable payments={payments} loading={loading} />
          )}
          {activeTab === 'invoices' && (
            <InvoiceList userId={localStorage.getItem('userId') || ''} />
          )}
          {activeTab === 'transactions' && (
            <TransactionFilter userId={localStorage.getItem('userId') || ''} />
          )}
        </div>

        {/* Account Information */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Email
              </p>
              <p className="text-gray-900">{localStorage.getItem('userEmail') || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Company
              </p>
              <p className="text-gray-900">{localStorage.getItem('userCompany') || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Phone
              </p>
              <p className="text-gray-900">{localStorage.getItem('userPhone') || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Member Since
              </p>
              <p className="text-gray-900">{localStorage.getItem('userCreatedAt') || 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
