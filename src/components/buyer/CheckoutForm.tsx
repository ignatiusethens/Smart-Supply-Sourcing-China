'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatting';
import { PaymentMethod } from '@/types';
import { validatePhoneNumber } from '@/lib/validation/schemas';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface CheckoutFormData {
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
}

const MPESA_LIMIT = 300000;

export function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const { items, totalAmount, getTotalDeposit } = useCartStore();
  const totalDeposit = getTotalDeposit();

  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: '',
    shippingCity: '',
    contactName: '',
    contactPhone: '',
    paymentMethod: 'bank-transfer',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Determine available payment methods based on order total
  const canUseMpesa = totalAmount <= MPESA_LIMIT;
  const canUseBankTransfer = true;

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    } else if (formData.shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = 'Shipping address must be at least 10 characters';
    }

    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = 'Shipping city is required';
    } else if (formData.shippingCity.trim().length < 2) {
      newErrors.shippingCity = 'Shipping city must be at least 2 characters';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (formData.contactName.trim().length < 2) {
      newErrors.contactName = 'Contact name must be at least 2 characters';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!validatePhoneNumber(formData.contactPhone)) {
      newErrors.contactPhone = 'Invalid Kenyan phone number format';
    }

    // Validate payment method selection
    if (formData.paymentMethod === 'mpesa' && !canUseMpesa) {
      newErrors.paymentMethod = 'M-Pesa is not available for orders exceeding KES 300,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Re-validate on change if field was touched
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Shipping Information */}
      <fieldset>
        <legend className="sr-only">Shipping Information</legend>
        <Card>
          <CardHeader className="pb-3 sm:pb-4 md:pb-5">
            <CardTitle className="text-lg sm:text-xl md:text-2xl" id="shipping-info-title">
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 md:space-y-6" role="group" aria-labelledby="shipping-info-title">
            <div>
              <label htmlFor="contactName" className="block text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-2.5">
                Contact Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="contactName"
                type="text"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                onBlur={() => handleBlur('contactName')}
                placeholder="Enter your full name"
                className={`text-sm sm:text-base h-12 sm:h-11 md:h-12 ${errors.contactName && touched.contactName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                aria-invalid={!!(errors.contactName && touched.contactName)}
                aria-describedby={errors.contactName && touched.contactName ? 'contactName-error' : undefined}
                required
                autoComplete="name"
              />
              {errors.contactName && touched.contactName && (
                <p id="contactName-error" className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1.5 sm:mt-2" role="alert" aria-live="polite">
                  {errors.contactName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-2.5">
                Contact Phone <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                onBlur={() => handleBlur('contactPhone')}
                placeholder="+254 or 0 followed by phone number"
                className={`text-sm sm:text-base h-12 sm:h-11 md:h-12 ${errors.contactPhone && touched.contactPhone ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                aria-invalid={!!(errors.contactPhone && touched.contactPhone)}
                aria-describedby={errors.contactPhone && touched.contactPhone ? 'contactPhone-error' : 'contactPhone-help'}
                required
                autoComplete="tel"
              />
              <p id="contactPhone-help" className="text-xs text-slate-500 mt-1">
                Enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)
              </p>
              {errors.contactPhone && touched.contactPhone && (
                <p id="contactPhone-error" className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1.5 sm:mt-2" role="alert" aria-live="polite">
                  {errors.contactPhone}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="shippingAddress" className="block text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-2.5">
                Shipping Address <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="shippingAddress"
                type="text"
                value={formData.shippingAddress}
                onChange={(e) => handleChange('shippingAddress', e.target.value)}
                onBlur={() => handleBlur('shippingAddress')}
                placeholder="Enter your delivery address"
                className={`text-sm sm:text-base h-12 sm:h-11 md:h-12 ${errors.shippingAddress && touched.shippingAddress ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                aria-invalid={!!(errors.shippingAddress && touched.shippingAddress)}
                aria-describedby={errors.shippingAddress && touched.shippingAddress ? 'shippingAddress-error' : undefined}
                required
                autoComplete="street-address"
              />
              {errors.shippingAddress && touched.shippingAddress && (
                <p id="shippingAddress-error" className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1.5 sm:mt-2" role="alert" aria-live="polite">
                  {errors.shippingAddress}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="shippingCity" className="block text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-2.5">
                Shipping City <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="shippingCity"
                type="text"
                value={formData.shippingCity}
                onChange={(e) => handleChange('shippingCity', e.target.value)}
                onBlur={() => handleBlur('shippingCity')}
                placeholder="Enter your city"
                className={`text-sm sm:text-base h-12 sm:h-11 md:h-12 ${errors.shippingCity && touched.shippingCity ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                aria-invalid={!!(errors.shippingCity && touched.shippingCity)}
                aria-describedby={errors.shippingCity && touched.shippingCity ? 'shippingCity-error' : undefined}
                required
                autoComplete="address-level2"
              />
              {errors.shippingCity && touched.shippingCity && (
                <p id="shippingCity-error" className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1.5 sm:mt-2" role="alert" aria-live="polite">
                  {errors.shippingCity}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </fieldset>

      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4 md:pb-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-xs sm:text-sm md:text-base">
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 sm:pt-4 md:pt-5 space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>

            {totalDeposit > 0 && (
              <div className="flex justify-between p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs sm:text-sm md:text-base">
                <span className="text-yellow-700 dark:text-yellow-300">
                  Pre-Order Deposit
                </span>
                <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                  {formatCurrency(totalDeposit)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base sm:text-lg md:text-xl font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4 md:pb-5">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 md:space-y-5">
          {/* M-Pesa Option */}
          <div
            className={`p-3 sm:p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-colors min-h-[100px] sm:min-h-[110px] flex flex-col justify-between ${
              formData.paymentMethod === 'mpesa'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            } ${!canUseMpesa ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (canUseMpesa) {
                handleChange('paymentMethod', 'mpesa');
              }
            }}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <input
                    type="radio"
                    id="mpesa"
                    name="paymentMethod"
                    value="mpesa"
                    checked={formData.paymentMethod === 'mpesa'}
                    onChange={() => {
                      if (canUseMpesa) {
                        handleChange('paymentMethod', 'mpesa');
                      }
                    }}
                    disabled={!canUseMpesa}
                    className="cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <label htmlFor="mpesa" className="font-semibold cursor-pointer text-sm sm:text-base md:text-lg">
                    M-Pesa
                  </label>
                  {canUseMpesa && (
                    <Badge variant="success" className="text-xs sm:text-sm">Instant</Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                  Instant payment via mobile money
                </p>
              </div>
            </div>

            {!canUseMpesa && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs sm:text-sm">
                M-Pesa is not available for orders exceeding KES 300,000. Please use Bank Transfer.
              </div>
            )}
          </div>

          {/* Bank Transfer Option */}
          <div
            className={`p-3 sm:p-4 md:p-5 border-2 rounded-lg cursor-pointer transition-colors min-h-[100px] sm:min-h-[110px] flex flex-col justify-between ${
              formData.paymentMethod === 'bank-transfer'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
            onClick={() => handleChange('paymentMethod', 'bank-transfer')}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <input
                    type="radio"
                    id="bank-transfer"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={formData.paymentMethod === 'bank-transfer'}
                    onChange={() => handleChange('paymentMethod', 'bank-transfer')}
                    className="cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 w-5 h-5 sm:w-6 sm:h-6"
                  />
                  <label htmlFor="bank-transfer" className="font-semibold cursor-pointer text-sm sm:text-base md:text-lg">
                    Bank Transfer
                  </label>
                  <Badge variant="info" className="text-xs sm:text-sm">1-3 Days</Badge>
                </div>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">
                  Direct bank transfer with manual reconciliation
                </p>
              </div>
            </div>
          </div>

          {errors.paymentMethod && (
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{errors.paymentMethod}</p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 text-sm sm:text-base md:text-lg h-12 sm:h-11 md:h-12"
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? 'Processing...' : 'Complete Order'}
      </Button>
    </form>
  );
}
