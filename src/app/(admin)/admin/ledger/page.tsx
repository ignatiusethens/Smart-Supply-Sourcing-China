'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LedgerTable } from '@/components/admin/LedgerTable';
import { VerificationGallery } from '@/components/admin/VerificationGallery';
import { ReconciliationActions } from '@/components/admin/ReconciliationActions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
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

export default function LedgerPage() {
  const router = useRouter();
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

        const response = await fetch(`/api/admin/ledger?${params.toString()}`);
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
    if (!selectedPaymentId) {
      setPaymentDetail(null);
      return;
    }

    const fetchPaymentDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await fetch(`/api/admin/ledger/${selectedPaymentId}`);
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
      const response = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'rejected',
          rejectionReason: reason,
          adminId: 'admin-user-id', // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh ledger
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
      const response = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'received',
          adminId: 'admin-user-id', // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh ledger
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
      const response = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action: 'reconciled',
          adminId: 'admin-user-id', // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh ledger
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

  if (selectedPaymentId && paymentDetail) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPaymentId(null)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Ledger
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Payment Reconciliation</h1>
          </div>
        </div>

        {/* Payment Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Verification Gallery */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Proofs</h2>
              <VerificationGallery
                proofs={paymentDetail.proofs}
                isLoading={isLoadingDetail}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reconciliation Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Reconciliation Ledger</h1>
        <p className="text-gray-600 mt-2">
          Review and reconcile bank transfer payments with orders
        </p>
      </div>

      {/* Ledger Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <LedgerTable
          records={records}
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
    </div>
  );
}
