'use client';

import { useState, useEffect } from 'react';
import { Quote, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentMethodSelector } from '@/components/shared/PaymentMethodSelector';

interface QuoteReviewCardProps {
  quote: Quote;
  onAccept?: (paymentMethod: PaymentMethod) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

export function QuoteReviewCard({ quote, onAccept, onError, isLoading = false }: QuoteReviewCardProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('bank-transfer');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiryDate = new Date(quote.validUntil);
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDaysRemaining(Math.max(0, diffDays));
      setIsExpired(diffDays <= 0 || quote.status === 'expired');
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [quote.validUntil, quote.status]);

  const handleAccept = async () => {
    if (isExpired) {
      onError?.('This quote has expired');
      return;
    }

    if (quote.status !== 'pending') {
      onError?.('This quote cannot be accepted in its current status');
      return;
    }

    onAccept?.(selectedPaymentMethod);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryStatusColor = () => {
    if (isExpired) return 'text-red-600';
    if (daysRemaining <= 2) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Quote Review</h2>
          <p className="text-gray-600">Quote ID: {quote.id}</p>
        </div>
        <Badge className={getStatusColor(quote.status)}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </Badge>
      </div>

      {/* Validity Period */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-semibold">{new Date(quote.validUntil).toLocaleDateString()}</p>
          </div>
          <div className={`text-right ${getExpiryStatusColor()}`}>
            <p className="text-sm">
              {isExpired ? 'EXPIRED' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Description</th>
                <th className="text-right py-2 px-2">Qty</th>
                <th className="text-right py-2 px-2">Unit Price</th>
                <th className="text-right py-2 px-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      {item.specifications && (
                        <p className="text-xs text-gray-600 mt-1">{item.specifications}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2">{item.quantity}</td>
                  <td className="text-right py-3 px-2">KES {item.unitPrice.toLocaleString()}</td>
                  <td className="text-right py-3 px-2 font-semibold">
                    KES {item.subtotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            KES {quote.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Method Selection */}
      {!isExpired && quote.status === 'pending' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
          <PaymentMethodSelector
            totalAmount={quote.totalAmount}
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isExpired && quote.status === 'pending' ? (
          <>
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Processing...' : 'Accept Quote'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Reject Quote
            </Button>
          </>
        ) : (
          <Button disabled className="w-full">
            {isExpired ? 'Quote Expired' : 'Quote Already ' + quote.status}
          </Button>
        )}
      </div>

      {/* Status Messages */}
      {isExpired && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            This quote has expired and can no longer be accepted. Please contact the supplier for a new quote.
          </p>
        </div>
      )}

      {quote.status === 'accepted' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            This quote has been accepted. Your order has been created and is ready for payment.
          </p>
        </div>
      )}
    </Card>
  );
}
