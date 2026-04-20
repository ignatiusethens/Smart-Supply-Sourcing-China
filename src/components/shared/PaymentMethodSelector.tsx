'use client';

import React from 'react';
import { PaymentMethod } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvailablePaymentMethods, getPaymentMethodRestrictionMessage } from '@/lib/algorithms/paymentRestrictions';
import { formatCurrency } from '@/lib/utils/formatting';

interface PaymentMethodSelectorProps {
  orderTotal: number;
  selectedMethod?: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  orderTotal,
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  const availableMethods = getAvailablePaymentMethods(orderTotal);
  const restrictionMessage = getPaymentMethodRestrictionMessage(orderTotal);

  const paymentMethodInfo: Record<PaymentMethod, { label: string; description: string }> = {
    'mpesa': {
      label: 'M-Pesa',
      description: 'Instant payment via M-Pesa STK Push',
    },
    'bank-transfer': {
      label: 'Bank Transfer',
      description: 'Manual bank transfer with payment proof upload',
    },
  };

  return (
    <div className="space-y-4">
      {restrictionMessage && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">{restrictionMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        {(['mpesa', 'bank-transfer'] as PaymentMethod[]).map((method) => {
          const isAvailable = availableMethods.includes(method);
          const isSelected = selectedMethod === method;
          const info = paymentMethodInfo[method];

          return (
            <Card
              key={method}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:border-slate-300'
              } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => isAvailable && onMethodChange(method)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={isSelected}
                        onChange={() => isAvailable && onMethodChange(method)}
                        disabled={!isAvailable}
                        className="w-4 h-4"
                      />
                      <label className="font-semibold cursor-pointer">
                        {info.label}
                      </label>
                      {!isAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          Not Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {info.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Order Total:</strong> {formatCurrency(orderTotal)}
        </p>
      </div>
    </div>
  );
}