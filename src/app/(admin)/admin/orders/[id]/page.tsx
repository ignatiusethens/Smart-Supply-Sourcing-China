'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationGallery } from '@/components/admin/VerificationGallery';
import { ReconciliationActions } from '@/components/admin/ReconciliationActions';
import { ArrowLeft } from 'lucide-react';
import { Order, Payment, TimelineEvent } from '@/types';

interface OrderDetail {
  order: Order;
  payment: Payment | null;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrderDetail(data.data);
        } else {
          console.error('Failed to fetch order:', data.error);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleReject = async (paymentId: string, reason: string) => {
    try {
      const response = await fetch('/api/payments/reconcile', {
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
        // Refresh order detail
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderResponse.json();
        if (orderData.success) {
          setOrderDetail(orderData.data);
        }
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
          adminId: 'admin-user-id',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh order detail
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderResponse.json();
        if (orderData.success) {
          setOrderDetail(orderData.data);
        }
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
          adminId: 'admin-user-id',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh order detail
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        const orderData = await orderResponse.json();
        if (orderData.success) {
          setOrderDetail(orderData.data);
        }
        alert('Payment reconciled successfully');
      } else {
        alert('Failed to reconcile payment: ' + data.error);
      }
    } catch (error) {
      console.error('Error reconciling payment:', error);
      alert('Error reconciling payment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
        </div>
      </div>
    );
  }

  const { order, payment } = orderDetail;

  const statusColors: Record<string, string> = {
    'pending-payment': 'bg-yellow-100 text-yellow-800',
    'payment-received': 'bg-blue-100 text-blue-800',
    'processing': 'bg-purple-100 text-purple-800',
    'shipped': 'bg-indigo-100 text-indigo-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const paymentStatusColors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-800',
    'processing': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
    'pending-reconciliation': 'bg-yellow-100 text-yellow-800',
    'received': 'bg-blue-100 text-blue-800',
    'reconciled': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">{order.referenceCode}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Reference Code</label>
                <p className="text-sm font-mono font-semibold text-blue-600 mt-1">{order.referenceCode}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Order Date</label>
                <p className="text-sm text-gray-700 mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Total Amount</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Payment Method</label>
                <p className="text-sm text-gray-700 mt-1 capitalize">
                  {order.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'M-Pesa'}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Name</label>
                <p className="text-sm text-gray-700 mt-1">{order.buyer?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Email</label>
                <p className="text-sm text-gray-700 mt-1">{order.buyer?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Phone</label>
                <p className="text-sm text-gray-700 mt-1">{order.contactPhone}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">City</label>
                <p className="text-sm text-gray-700 mt-1">{order.shippingCity}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 uppercase">Shipping Address</label>
                <p className="text-sm text-gray-700 mt-1">{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Proofs */}
          {payment && payment.proofs.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Proofs</h2>
              <VerificationGallery proofs={payment.proofs} />
            </div>
          )}

          {/* Event Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Timeline</h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                      {index < order.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900 capitalize">{event.status.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(event.createdAt).toLocaleString('en-KE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Payment Status</label>
              <Badge className={`${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-800'} mt-2`}>
                {order.paymentStatus.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Order Status</label>
              <Badge className={`${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'} mt-2`}>
                {order.orderStatus.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          {/* Reconciliation Actions */}
          {payment && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <ReconciliationActions
                payment={payment}
                order={order}
                isLoading={isLoading}
                onReject={handleReject}
                onMarkReceived={handleMarkReceived}
                onMarkReconciled={handleMarkReconciled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
