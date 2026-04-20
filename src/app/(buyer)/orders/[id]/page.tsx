'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { OrderTimeline } from '@/components/buyer/OrderTimeline';
import { PaymentInstructions } from '@/components/buyer/PaymentInstructions';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import Link from 'next/link';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paramId, setParamId] = useState<string>('');

  useEffect(() => {
    params.then(p => setParamId(p.id));
  }, [params]);

  useEffect(() => {
    if (!paramId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${paramId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paramId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-800">{error || 'Order not found'}</p>
            <Link href="/orders">
              <button className="mt-4 text-red-600 hover:text-red-700 font-medium">
                ← Back to Orders
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders">
            <button className="text-blue-600 hover:text-blue-700 font-medium mb-4">
              ← Back to Orders
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.referenceCode}
          </h1>
          <p className="text-gray-600 mt-2">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
              Order Status
            </p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {order.orderStatus.replace('-', ' ')}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
              Payment Status
            </p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {order.paymentStatus.replace('-', ' ')}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-2">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details and Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                      {item.isPreOrder && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          Pre-Order
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(
                      order.items.reduce((sum, item) => sum + item.subtotal, 0)
                    )}
                  </span>
                </div>
                {order.depositAmount && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Deposit</span>
                    <span className="text-gray-900">
                      {formatCurrency(order.depositAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Contact Name</p>
                  <p className="font-semibold text-gray-900">{order.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Phone</p>
                  <p className="font-semibold text-gray-900">{order.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="font-semibold text-gray-900">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-semibold text-gray-900">{order.shippingCity}</p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <OrderTimeline events={order.timeline} currentStatus={order.orderStatus} />
          </div>

          {/* Right Column - Payment Instructions */}
          <div className="lg:col-span-1">
            <PaymentInstructions order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
