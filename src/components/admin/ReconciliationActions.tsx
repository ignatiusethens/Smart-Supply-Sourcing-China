'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Payment, Order } from '@/types';

interface ReconciliationActionsProps {
  payment: Payment;
  order: Order;
  isLoading?: boolean;
  onReject?: (paymentId: string, reason: string) => Promise<void>;
  onMarkReceived?: (paymentId: string) => Promise<void>;
  onMarkReconciled?: (paymentId: string) => Promise<void>;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'pending-reconciliation': {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-yellow-600',
    label: 'Pending Reconciliation',
  },
  'received': {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-blue-600',
    label: 'Payment Received',
  },
  'reconciled': {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-600',
    label: 'Reconciled',
  },
  'rejected': {
    icon: <XCircle className="w-5 h-5" />,
    color: 'text-red-600',
    label: 'Rejected',
  },
};

export function ReconciliationActions({
  payment,
  order,
  isLoading = false,
  onReject,
  onMarkReceived,
  onMarkReconciled,
}: ReconciliationActionsProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = statusConfig[payment.status] || statusConfig['pending-reconciliation'];

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject?.(payment.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReceived = async () => {
    setIsSubmitting(true);
    try {
      await onMarkReceived?.(payment.id);
    } catch (error) {
      console.error('Error marking payment as received:', error);
      alert('Failed to mark payment as received');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReconciled = async () => {
    setIsSubmitting(true);
    try {
      await onMarkReconciled?.(payment.id);
    } catch (error) {
      console.error('Error reconciling payment:', error);
      alert('Failed to reconcile payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReject = ['pending-reconciliation', 'received'].includes(payment.status);
  const canMarkReceived = payment.status === 'pending-reconciliation';
  const canMarkReconciled = ['pending-reconciliation', 'received'].includes(payment.status);

  return (
    <div className="space-y-6">
      {/* Payment Status */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={config.color}>{config.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">Payment Status</h3>
            <p className="text-sm text-gray-600">{config.label}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Reference Code</label>
            <p className="text-sm font-mono font-semibold text-blue-600 mt-1">{order.referenceCode}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Amount</label>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(payment.amount)}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Payment Method</label>
            <p className="text-sm text-gray-700 mt-1 capitalize">
              {payment.method === 'bank-transfer' ? 'Bank Transfer' : 'M-Pesa'}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Payment Date</label>
            <p className="text-sm text-gray-700 mt-1">
              {new Date(payment.createdAt).toLocaleDateString('en-KE')}
            </p>
          </div>
        </div>

        {/* Rejection Reason */}
        {payment.status === 'rejected' && payment.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Rejection Reason</p>
                <p className="text-sm text-red-700 mt-1">{payment.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reconciliation Info */}
        {payment.status === 'reconciled' && payment.reconciledAt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              Reconciled on {new Date(payment.reconciledAt).toLocaleDateString('en-KE')}
            </p>
          </div>
        )}
      </div>

      {/* Order Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Buyer Name</label>
            <p className="text-sm text-gray-700 mt-1">{order.buyer?.name || 'Unknown'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Buyer Email</label>
            <p className="text-sm text-gray-700 mt-1">{order.buyer?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Contact Phone</label>
            <p className="text-sm text-gray-700 mt-1">{order.contactPhone}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">Shipping City</label>
            <p className="text-sm text-gray-700 mt-1">{order.shippingCity}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase">Shipping Address</label>
            <p className="text-sm text-gray-700 mt-1">{order.shippingAddress}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {payment.status !== 'reconciled' && payment.status !== 'rejected' && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
          <h3 className="font-semibold text-gray-900">Reconciliation Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {canMarkReceived && (
              <Button
                onClick={handleMarkReceived}
                disabled={isLoading || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Mark payment as received"
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Mark Received
              </Button>
            )}
            {canMarkReconciled && (
              <Button
                onClick={handleMarkReconciled}
                disabled={isLoading || isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                aria-label="Mark payment as reconciled"
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Mark Reconciled
              </Button>
            )}
            {canReject && (
              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={isLoading || isSubmitting}
                variant="destructive"
                className="gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                aria-label="Reject payment"
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Reject Payment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 
              id="reject-modal-title"
              className="text-lg font-semibold text-gray-900 mb-4"
            >
              Reject Payment
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this payment. The buyer will be notified.
            </p>

            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="rejection-reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rejection Reason
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Amount mismatch, Invalid reference code, Duplicate payment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label="Cancel rejection"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  aria-label="Confirm payment rejection"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
