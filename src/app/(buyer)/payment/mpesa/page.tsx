'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/formatting';
import { validatePhoneNumber } from '@/lib/validation/schemas';
import { Order } from '@/types';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Smartphone,
} from 'lucide-react';

type PaymentStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';

/** Masks a phone number like +254712345678 → +254 7** *** 678 */
function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.length < 6) return phone;
  // Show first 5 chars and last 3 chars, mask the rest
  const prefix = cleaned.slice(0, 5);
  const suffix = cleaned.slice(-3);
  const masked = '*'.repeat(Math.max(0, cleaned.length - 8));
  return `${prefix} ${masked} ${suffix}`;
}

function MpesaPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch order');
        }

        setOrder(result.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load order';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError(null);
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || !order) {
      setError('Order information is missing');
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      setError(
        'Invalid Kenyan phone number format. Use +254 or 0 followed by phone number'
      );
      return;
    }

    setPaymentStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/payments/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          phoneNumber,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to initiate payment');
      }

      setTransactionId(result.data.transactionId);
      setPaymentStatus('pending');

      // Simulate waiting for payment confirmation
      // In production, this would poll the backend for payment status
      setTimeout(() => {
        setPaymentStatus('success');
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      setPaymentStatus('error');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setError(null);
    setTransactionId(null);
    setPhoneNumber('');
  };

  const handleContinue = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading order details...</span>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (error && !order) {
    return (
      <BuyerLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/orders')}
                  >
                    Back to Orders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </BuyerLayout>
    );
  }

  if (!order) {
    return (
      <BuyerLayout>
        <div className="max-w-2xl mx-auto py-12">
          <p className="text-center text-slate-600">Order not found</p>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">M-Pesa Payment</h1>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Order Reference
              </span>
              <span className="font-semibold">{order.referenceCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Items</span>
              <span className="font-semibold">{order.items.length}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-blue-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Success */}
        {paymentStatus === 'success' && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                    Your payment has been processed successfully. Your order is
                    now confirmed.
                  </p>
                  {transactionId && (
                    <p className="text-xs text-green-700 dark:text-green-300 mb-4">
                      Transaction ID: {transactionId}
                    </p>
                  )}
                  <Button onClick={handleContinue} className="w-full">
                    View Order Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* M-Pesa Pending Modal-style Card (Page 8) */}
        {paymentStatus === 'pending' && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
              {/* Green circle with phone icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Check your phone
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Enter your M-Pesa PIN to complete the payment
              </p>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm font-medium text-slate-700">
                  Waiting for authorization...
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-8">
                Request sent to {maskPhoneNumber(phoneNumber)}
              </p>

              {/* Numbered steps */}
              <div className="space-y-3 text-left">
                {[
                  'Unlock your phone and open the M-Pesa notification',
                  'Enter your secret PIN when prompted',
                  'Wait for the confirmation screen here',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Error */}
        {paymentStatus === 'error' && error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Payment Failed
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {paymentStatus === 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Phone Number</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+254 or 0 followed by phone number"
                      className="pl-10"
                      disabled={
                        paymentStatus !== 'idle' && paymentStatus !== 'error'
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Example: +254712345678 or 0712345678
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Enter your M-Pesa registered phone number</li>
                    <li>
                      You&apos;ll receive an STK Push prompt on your phone
                    </li>
                    <li>Enter your M-Pesa PIN to authorize the payment</li>
                    <li>Payment will be processed immediately</li>
                  </ol>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={
                    (paymentStatus !== 'idle' && paymentStatus !== 'error') ||
                    !phoneNumber
                  }
                >
                  {(paymentStatus as PaymentStatus) === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initiating Payment...
                    </>
                  ) : (
                    'Initiate M-Pesa Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </BuyerLayout>
  );
}

export default function MpesaPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <MpesaPaymentContent />
    </Suspense>
  );
}
