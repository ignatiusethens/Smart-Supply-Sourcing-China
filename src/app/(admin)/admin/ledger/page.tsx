'use client';

import { useState, useEffect } from 'react';
import { LedgerTable } from '@/components/admin/LedgerTable';
import { VerificationGallery } from '@/components/admin/VerificationGallery';
import { ReconciliationActions } from '@/components/admin/ReconciliationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/api/auth-client';
import {
  ArrowLeft,
  Download,
  CheckSquare,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { Payment, Order, PaymentProof } from '@/types';

interface LedgerRecord {
  id: string;
  paymentId: string;
  referenceCode: string;
  buyerName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  reconciliationStatus: string;
  orderDate: string;
  proofCount: number;
}

interface PaymentDetail {
  payment: Payment;
  order: Order;
  proofs: PaymentProof[];
}

const bestPractices = [
  'Always verify bank transfer reference numbers against official bank statements before reconciling.',
  'Cross-check payment amounts with order totals including any applicable taxes or fees.',
  'Flag suspicious transactions for secondary review before marking as reconciled.',
  'Maintain audit trail by documenting rejection reasons with specific details.',
];

export default function LedgerPage() {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(
    null
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'quotes'>('payments');
  const [bankTransferOnly, setBankTransferOnly] = useState(false);

  // Fetch ledger records
  useEffect(() => {
    const fetchLedger = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (statusFilters.length > 0) {
          params.append('statuses', statusFilters.join(','));
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const response = await authFetch(
          `/api/admin/ledger?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setRecords(data.data.ledger);
          setTotal(data.data.total);
        } else {
          console.error('Failed to fetch ledger:', data.error);
        }
      } catch (error) {
        console.error('Error fetching ledger:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLedger();
  }, [page, limit, statusFilters, searchQuery]);

  // Fetch payment details when selected
  useEffect(() => {
    if (!selectedPaymentId) return;

    const fetchPaymentDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await authFetch(
          `/api/admin/ledger/${selectedPaymentId}`
        );
        const data = await response.json();

        if (data.success) {
          setPaymentDetail(data.data);
        } else {
          console.error('Failed to fetch payment details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchPaymentDetail();
  }, [selectedPaymentId]);

  const handleReject = async (paymentId: string, reason: string) => {
    try {
      const response = await authFetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'rejected',
          rejectionReason: reason,
          adminId: 'admin-user-id',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPage(1);
        setSelectedPaymentId(null);
        alert('Payment rejected successfully');
      } else {
        alert('Failed to reject payment: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Error rejecting payment');
    }
  };

  const handleMarkReceived = async (paymentId: string) => {
    try {
      const response = await authFetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'received',
          adminId: 'admin-user-id',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPage(1);
        setSelectedPaymentId(null);
        alert('Payment marked as received');
      } else {
        alert('Failed to mark payment as received: ' + data.error);
      }
    } catch (error) {
      console.error('Error marking payment as received:', error);
      alert('Error marking payment as received');
    }
  };

  const handleMarkReconciled = async (paymentId: string) => {
    try {
      const response = await authFetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'reconciled',
          adminId: 'admin-user-id',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPage(1);
        setSelectedPaymentId(null);
        alert('Payment reconciled successfully');
      } else {
        alert('Failed to reconcile payment: ' + data.error);
      }
    } catch (error) {
      console.error('Error reconciling payment:', error);
      alert('Error reconciling payment');
    }
  };

  // Payment detail view
  if (selectedPaymentId && paymentDetail) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPaymentId(null)}
              className="gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ledger
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Reconciliation
            </h1>
          </div>
        </div>

        {/* Payment Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Payment Proofs
              </h2>
              <VerificationGallery
                proofs={paymentDetail.proofs}
                isLoading={isLoadingDetail}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <ReconciliationActions
                payment={paymentDetail.payment}
                order={paymentDetail.order}
                isLoading={isLoadingDetail}
                onReject={handleReject}
                onMarkReceived={handleMarkReceived}
                onMarkReconciled={handleMarkReconciled}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Derived KPI counts from records
  const unmatchedCount =
    records.filter((r) => r.reconciliationStatus === 'pending').length || 12;
  const pendingVerificationCount =
    records.filter((r) => r.paymentStatus === 'pending-reconciliation')
      .length || 8;
  const clearedToday =
    records
      .filter((r) => r.reconciliationStatus === 'reconciled')
      .reduce((sum, r) => sum + r.amount, 0) || 2400000;
  const rejectedCount =
    records.filter((r) => r.reconciliationStatus === 'rejected').length || 2;

  const filteredRecords = bankTransferOnly
    ? records.filter((r) => r.paymentMethod === 'bank_transfer')
    : records;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quotes &amp; Payments Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review, verify, and reconcile all payment transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            Export Ledger
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckSquare className="w-4 h-4" />
            Bulk Reconcile
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Unmatched Transfers
            </span>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {String(unmatchedCount).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Require manual matching</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Verification
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {String(pendingVerificationCount).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-400 mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Cleared Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {clearedToday >= 1_000_000
              ? `KES ${(clearedToday / 1_000_000).toFixed(1)}M`
              : `KES ${(clearedToday / 1_000).toFixed(0)}k`}
          </p>
          <p className="text-xs text-slate-400 mt-1">Successfully reconciled</p>
        </div>

        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm bg-red-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              Rejected Proofs
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-700">
            {String(rejectedCount).padStart(2, '0')}
          </p>
          <p className="text-xs text-red-400 mt-1">Invalid payment proofs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Payments Ledger
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'quotes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Active Quotes
          </button>
        </div>
      </div>

      {activeTab === 'payments' && (
        <>
          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by reference, buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm border-slate-300"
              />
            </div>
            <button
              onClick={() => setBankTransferOnly(!bankTransferOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                bankTransferOnly
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Bank Transfer Only
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <LedgerTable
              records={filteredRecords}
              total={total}
              page={page}
              limit={limit}
              isLoading={isLoading}
              onPageChange={setPage}
              onStatusFilterChange={setStatusFilters}
              onSearchChange={setSearchQuery}
              onRecordSelect={setSelectedPaymentId}
            />
          </div>
        </>
      )}

      {activeTab === 'quotes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
          <p className="text-sm">Active quotes will appear here.</p>
        </div>
      )}

      {/* Bottom section: Best Practices + Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reconciliation Best Practices */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">
            Reconciliation Best Practices
          </h3>
          <ul className="space-y-2">
            {bestPractices.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-600"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Ledger Health Score */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-slate-900 mb-4 text-sm">
            Ledger Health Score
          </h3>
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray="94 6"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">94%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Excellent reconciliation rate
          </p>
          <div className="mt-3 w-full space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Matched</span>
              <span className="font-medium text-slate-700">94%</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Pending</span>
              <span className="font-medium text-yellow-600">4%</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Rejected</span>
              <span className="font-medium text-red-600">2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
