'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatCurrency } from '@/lib/utils/formatting';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Lock,
  Shield,
  Truck,
} from 'lucide-react';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
}

export function CartSummary({
  showCheckoutButton = true,
  onCheckout,
}: CartSummaryProps) {
  const { items, totalAmount, updateQuantity, removeItem, getTotalDeposit } =
    useCartStore();
  const totalDeposit = getTotalDeposit();

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center"
        role="status"
        aria-label="Empty cart"
      >
        <div className="w-16 h-16 bg-[#e8f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-[#1a6b50]" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Browse our catalog and add products to get started.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#1a6b50] hover:bg-[#155a42] text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Browse Catalog →
        </Link>
      </div>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── LEFT: Cart items ── */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-gray-500">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
          </p>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-[#1a6b50] hover:text-[#155a42] transition-colors"
          >
            + Add more items
          </Link>
        </div>

        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 items-start"
          >
            {/* Product image placeholder */}
            <div className="w-16 h-16 rounded-xl bg-[#e8f4f0] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <span className="text-2xl opacity-40">📦</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                  {item.productName}
                </h3>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label={`Remove ${item.productName} from cart`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {item.isPreOrder && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold mb-2">
                  Pre-Order
                </span>
              )}

              <p className="text-xs text-gray-400 mb-3">
                {formatCurrency(item.unitPrice)} / unit
                {item.isPreOrder && item.depositAmount && (
                  <span className="ml-2 text-amber-600">
                    · Deposit: {formatCurrency(item.depositAmount)}/unit
                  </span>
                )}
              </p>

              {/* Quantity + subtotal row */}
              <div className="flex items-center justify-between">
                {/* Quantity controls */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 border-r border-gray-200"
                    aria-label={`Decrease quantity of ${item.productName}`}
                  >
                    <Minus className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.quantity >= 100}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 border-l border-gray-200"
                    aria-label={`Increase quantity of ${item.productName}`}
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <p className="font-black text-base text-[#1a6b50]">
                    {formatCurrency(item.subtotal)}
                  </p>
                  {item.isPreOrder && item.depositAmount && (
                    <p className="text-[10px] text-amber-600 font-semibold">
                      Deposit:{' '}
                      {formatCurrency(item.depositAmount * item.quantity)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            {
              icon: <Shield className="w-4 h-4 text-[#1a6b50]" />,
              label: 'Verified Suppliers',
            },
            {
              icon: <Truck className="w-4 h-4 text-[#1a6b50]" />,
              label: 'Tracked Delivery',
            },
            {
              icon: <Lock className="w-4 h-4 text-[#1a6b50]" />,
              label: 'Secure Escrow',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5"
            >
              {item.icon}
              <span className="text-xs font-semibold text-gray-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Order summary ── */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Subtotal ({itemCount} items)
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Sourcing Fee</span>
                <span className="font-semibold text-[#1a6b50]">Included</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-gray-500">
                  Calculated at checkout
                </span>
              </div>

              {totalDeposit > 0 && (
                <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                  <span className="text-amber-700 font-semibold">
                    Pre-Order Deposit
                  </span>
                  <span className="font-bold text-amber-700">
                    {formatCurrency(totalDeposit)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-xl text-[#1a6b50]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment options */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Payment Options
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 bg-[#e8f4f0] border border-[#b2d8cc] rounded-xl">
                  <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-black">M</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">
                      M-Pesa
                    </p>
                    <p className="text-[9px] text-[#1a6b50] font-semibold">
                      Instant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-black">B</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">Bank</p>
                    <p className="text-[9px] text-blue-600 font-semibold">
                      1–3 Days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {showCheckoutButton && (
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#1a6b50] hover:bg-[#155a42] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50] focus-visible:ring-offset-2"
                aria-label="Proceed to checkout"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            <Link
              href="/catalog"
              className="w-full flex items-center justify-center gap-2 mt-3 border border-gray-200 text-gray-600 hover:border-[#1a6b50] hover:text-[#1a6b50] font-semibold py-3 rounded-xl transition-colors text-sm"
              aria-label="Continue shopping"
            >
              Continue Shopping
            </Link>

            <div className="flex items-center justify-center gap-1.5 mt-4">
              <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                Secure Checkout via Pan-Africa Escrow
              </span>
            </div>
          </div>

          {/* Pro tip */}
          <div className="flex items-start gap-3 bg-[#e8f4f0] border border-[#b2d8cc] rounded-xl px-4 py-3">
            <span className="text-[#1a6b50] text-base mt-0.5">💡</span>
            <p className="text-xs text-[#1a6b50] leading-relaxed">
              <span className="font-bold">Need a custom quote?</span> Submit a
              sourcing request and our team will negotiate factory-direct
              pricing for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
