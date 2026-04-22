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
import {
  Shield,
  Truck,
  Smartphone,
  Building2,
  Lock,
  MessageCircle,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react';

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
const STANDARD_SHIPPING = 75;
const EXPRESS_SHIPPING = 150;
const TAX_RATE = 0.16;

export function CheckoutForm({
  onSubmit,
  isLoading = false,
}: CheckoutFormProps) {
  const { items, totalAmount, getTotalDeposit, updateQuantity, removeItem } =
    useCartStore();
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
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>(
    'standard'
  );

  // Determine available payment methods based on order total
  const canUseMpesa = totalAmount <= MPESA_LIMIT;

  // Shipping cost based on selected method
  const shippingCost =
    shippingMethod === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING;

  // Order summary calculations
  const subtotal = totalAmount;
  const estimatedTax = subtotal * TAX_RATE;
  const totalWithShippingAndTax = subtotal + shippingCost + estimatedTax;

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    } else if (formData.shippingAddress.trim().length < 10) {
      newErrors.shippingAddress =
        'Shipping address must be at least 10 characters';
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
      newErrors.paymentMethod =
        'M-Pesa is not available for orders exceeding KES 300,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      // Re-validate on change if field was touched
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: keyof CheckoutFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (main content) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Items Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Shield className="h-5 w-5 text-blue-600" />
                Review Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50"
                >
                  {/* Image placeholder */}
                  <div className="w-14 h-14 rounded-md bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      SKU: {item.productId.slice(0, 8).toUpperCase()}
                    </p>
                    {item.isPreOrder && (
                      <Badge variant="warning" className="mt-1 text-xs">
                        Pre-Order
                      </Badge>
                    )}
                    {!item.isPreOrder && (
                      <Badge variant="success" className="mt-1 text-xs">
                        Paid
                      </Badge>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                      aria-label={`Decrease quantity of ${item.productName}`}
                    >
                      <Minus className="h-3 w-3 text-slate-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors"
                      aria-label={`Increase quantity of ${item.productName}`}
                    >
                      <Plus className="h-3 w-3 text-slate-600" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0 min-w-[80px]">
                    <p className="font-semibold text-sm text-slate-800">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors flex-shrink-0"
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add More Items link */}
              <a
                href="/catalog"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add More Items
              </a>
            </CardContent>
          </Card>

          {/* Shipping Information Card */}
          <fieldset>
            <legend className="sr-only">Shipping Information</legend>
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle
                  className="flex items-center gap-2 text-lg font-semibold text-slate-800"
                  id="shipping-info-title"
                >
                  <Truck className="h-5 w-5 text-blue-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent
                className="pt-4 space-y-4"
                role="group"
                aria-labelledby="shipping-info-title"
              >
                {/* 2-column row: Full Name + City/Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Full Name{' '}
                      <span className="text-red-500" aria-label="required">
                        *
                      </span>
                    </label>
                    <Input
                      id="contactName"
                      type="text"
                      value={formData.contactName}
                      onChange={(e) =>
                        handleChange('contactName', e.target.value)
                      }
                      onBlur={() => handleBlur('contactName')}
                      placeholder="Enter your full name"
                      className={`h-10 ${errors.contactName && touched.contactName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                      aria-invalid={
                        !!(errors.contactName && touched.contactName)
                      }
                      aria-describedby={
                        errors.contactName && touched.contactName
                          ? 'contactName-error'
                          : undefined
                      }
                      required
                      autoComplete="name"
                    />
                    {errors.contactName && touched.contactName && (
                      <p
                        id="contactName-error"
                        className="text-red-600 text-xs mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.contactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="shippingCity"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      City / Region{' '}
                      <span className="text-red-500" aria-label="required">
                        *
                      </span>
                    </label>
                    <Input
                      id="shippingCity"
                      type="text"
                      value={formData.shippingCity}
                      onChange={(e) =>
                        handleChange('shippingCity', e.target.value)
                      }
                      onBlur={() => handleBlur('shippingCity')}
                      placeholder="Enter your city"
                      className={`h-10 ${errors.shippingCity && touched.shippingCity ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                      aria-invalid={
                        !!(errors.shippingCity && touched.shippingCity)
                      }
                      aria-describedby={
                        errors.shippingCity && touched.shippingCity
                          ? 'shippingCity-error'
                          : undefined
                      }
                      required
                      autoComplete="address-level2"
                    />
                    {errors.shippingCity && touched.shippingCity && (
                      <p
                        id="shippingCity-error"
                        className="text-red-600 text-xs mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.shippingCity}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2-column row: Delivery Address + Contact Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="shippingAddress"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Delivery Address{' '}
                      <span className="text-red-500" aria-label="required">
                        *
                      </span>
                    </label>
                    <Input
                      id="shippingAddress"
                      type="text"
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        handleChange('shippingAddress', e.target.value)
                      }
                      onBlur={() => handleBlur('shippingAddress')}
                      placeholder="Enter your delivery address"
                      className={`h-10 ${errors.shippingAddress && touched.shippingAddress ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                      aria-invalid={
                        !!(errors.shippingAddress && touched.shippingAddress)
                      }
                      aria-describedby={
                        errors.shippingAddress && touched.shippingAddress
                          ? 'shippingAddress-error'
                          : undefined
                      }
                      required
                      autoComplete="street-address"
                    />
                    {errors.shippingAddress && touched.shippingAddress && (
                      <p
                        id="shippingAddress-error"
                        className="text-red-600 text-xs mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.shippingAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Contact Phone{' '}
                      <span className="text-red-500" aria-label="required">
                        *
                      </span>
                    </label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) =>
                        handleChange('contactPhone', e.target.value)
                      }
                      onBlur={() => handleBlur('contactPhone')}
                      placeholder="+254 or 0 followed by number"
                      className={`h-10 ${errors.contactPhone && touched.contactPhone ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                      aria-invalid={
                        !!(errors.contactPhone && touched.contactPhone)
                      }
                      aria-describedby={
                        errors.contactPhone && touched.contactPhone
                          ? 'contactPhone-error'
                          : 'contactPhone-help'
                      }
                      required
                      autoComplete="tel"
                    />
                    <p
                      id="contactPhone-help"
                      className="text-xs text-slate-500 mt-1"
                    >
                      e.g. +254712345678 or 0712345678
                    </p>
                    {errors.contactPhone && touched.contactPhone && (
                      <p
                        id="contactPhone-error"
                        className="text-red-600 text-xs mt-1"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.contactPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Method Cards */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Shipping Method
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Standard Shipping */}
                    <button
                      type="button"
                      onClick={() => setShippingMethod('standard')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        shippingMethod === 'standard'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      aria-pressed={shippingMethod === 'standard'}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800">
                          Standard
                        </span>
                        <span className="font-bold text-sm text-slate-800">
                          ${STANDARD_SHIPPING}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        5–7 business days
                      </p>
                    </button>

                    {/* Express Shipping */}
                    <button
                      type="button"
                      onClick={() => setShippingMethod('express')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        shippingMethod === 'express'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      aria-pressed={shippingMethod === 'express'}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800">
                          Express
                        </span>
                        <span className="font-bold text-sm text-slate-800">
                          ${EXPRESS_SHIPPING}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        1–2 business days
                      </p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </fieldset>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Payment Method Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              {/* M-Pesa Option */}
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'mpesa'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${!canUseMpesa ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (canUseMpesa) handleChange('paymentMethod', 'mpesa');
                }}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    id="mpesa"
                    name="paymentMethod"
                    value="mpesa"
                    checked={formData.paymentMethod === 'mpesa'}
                    onChange={() => {
                      if (canUseMpesa) handleChange('paymentMethod', 'mpesa');
                    }}
                    disabled={!canUseMpesa}
                    className="mt-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Smartphone className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <label
                        htmlFor="mpesa"
                        className="font-semibold text-sm text-slate-800 cursor-pointer"
                      >
                        M-Pesa
                      </label>
                      {canUseMpesa && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                          INSTANT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Instant payment via mobile money
                    </p>
                    {!canUseMpesa && (
                      <p className="text-xs text-red-600 mt-1">
                        Not available for orders over KES 300,000
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Transfer Option */}
              <div
                className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'bank-transfer'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleChange('paymentMethod', 'bank-transfer')}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    id="bank-transfer"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={formData.paymentMethod === 'bank-transfer'}
                    onChange={() =>
                      handleChange('paymentMethod', 'bank-transfer')
                    }
                    className="mt-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <label
                        htmlFor="bank-transfer"
                        className="font-semibold text-sm text-slate-800 cursor-pointer"
                      >
                        Bank Transfer
                      </label>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                        1-3 DAYS
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct bank transfer with manual reconciliation
                    </p>
                  </div>
                </div>
              </div>

              {errors.paymentMethod && (
                <p className="text-red-600 text-xs">{errors.paymentMethod}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Estimated Shipping (
                  {shippingMethod === 'express' ? 'Express' : 'Standard'})
                </span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Estimated Tax (16%)</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(estimatedTax)}
                </span>
              </div>

              {totalDeposit > 0 && (
                <div className="flex justify-between text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-yellow-700">Pre-Order Deposit</span>
                  <span className="font-semibold text-yellow-700">
                    {formatCurrency(totalDeposit)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatCurrency(totalWithShippingAndTax)}
                </span>
              </div>

              {/* Pay Now Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                disabled={isLoading || items.length === 0}
              >
                {isLoading
                  ? 'Processing...'
                  : formData.paymentMethod === 'mpesa'
                    ? 'Pay Now via M-Pesa'
                    : 'Pay via Bank Transfer'}
              </Button>

              {/* SSL badge */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span className="uppercase tracking-wide font-medium">
                  SECURE SSL ENCRYPTED TRANSACTION
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Need Help Card */}
          <Card className="border border-blue-100 bg-blue-50 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    NEED HELP?
                  </p>
                  <p className="text-sm font-semibold text-blue-700 mt-0.5">
                    Chat with Sourcing Expert
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Our team is available to assist with your order.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
