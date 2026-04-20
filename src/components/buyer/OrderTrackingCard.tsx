'use client';

import { Order, OrderStatus, PaymentStatus } from '@/types';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';

interface OrderTrackingCardProps {
  order: Order;
}

const statusColors: Record<OrderStatus, string> = {
  'pending-payment': 'bg-yellow-100 text-yellow-800',
  'payment-received': 'bg-blue-100 text-blue-800',
  'processing': 'bg-purple-100 text-purple-800',
  'shipped': 'bg-indigo-100 text-indigo-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  'pending': 'bg-yellow-50 text-yellow-700',
  'processing': 'bg-blue-50 text-blue-700',
  'completed': 'bg-green-50 text-green-700',
  'failed': 'bg-red-50 text-red-700',
  'pending-reconciliation': 'bg-orange-50 text-orange-700',
  'received': 'bg-blue-50 text-blue-700',
  'reconciled': 'bg-green-50 text-green-700',
  'rejected': 'bg-red-50 text-red-700',
};

const statusLabels: Record<OrderStatus, string> = {
  'pending-payment': 'Pending Payment',
  'payment-received': 'Payment Received',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  'pending': 'Pending',
  'processing': 'Processing',
  'completed': 'Completed',
  'failed': 'Failed',
  'pending-reconciliation': 'Pending Reconciliation',
  'received': 'Received',
  'reconciled': 'Reconciled',
  'rejected': 'Rejected',
};

export function OrderTrackingCard({ order }: OrderTrackingCardProps) {
  const itemCount = order.items.length;
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link 
      href={`/orders/${order.id}`}
      className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-lg"
    >
      <div 
        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white"
        role="article"
        aria-label={`Order ${order.referenceCode} details`}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.referenceCode}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge 
            className={statusColors[order.orderStatus]}
            aria-label={`Order status: ${statusLabels[order.orderStatus]}`}
          >
            {statusLabels[order.orderStatus]}
          </Badge>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Items</p>
            <p className="text-lg font-semibold text-gray-900">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalItems} units)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Status</p>
          <div className="flex items-center justify-between">
            <Badge 
              className={paymentStatusColors[order.paymentStatus]}
              aria-label={`Payment status: ${paymentStatusLabels[order.paymentStatus]}`}
            >
              {paymentStatusLabels[order.paymentStatus]}
            </Badge>
            {order.paymentMethod && (
              <span className="text-xs text-gray-600">
                via {order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
              </span>
            )}
          </div>
        </div>

        {/* Items Preview */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Items</p>
          <div className="space-y-2">
            {order.items.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate">{item.productName}</span>
                <span className="text-gray-600 ml-2">x{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-gray-500 italic">
                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Action Hint */}
        <div className="mt-4 text-xs text-blue-600 font-medium">
          View Details →
        </div>
      </div>
    </Link>
  );
}
