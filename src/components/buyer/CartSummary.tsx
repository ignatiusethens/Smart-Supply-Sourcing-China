'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatting';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
}

export function CartSummary({ showCheckoutButton = true, onCheckout }: CartSummaryProps) {
  const { items, totalAmount, updateQuantity, removeItem, getTotalDeposit } = useCartStore();
  const totalDeposit = getTotalDeposit();

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div 
            className="text-center py-12"
            role="status"
            aria-label="Empty cart"
          >
            <p className="text-slate-600 dark:text-slate-400 mb-4">Your cart is empty</p>
            <Link href="/catalog">
              <Button className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{item.productName}</h3>
                    {item.isPreOrder && (
                      <Badge variant="warning">Pre-Order</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.unitPrice)} each
                  </p>
                  {item.isPreOrder && item.depositAmount && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Deposit: {formatCurrency(item.depositAmount)} per unit
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mx-4">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={`Decrease quantity of ${item.productName}`}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = Math.max(1, Number(e.target.value));
                      updateQuantity(item.productId, value);
                    }}
                    className="w-16 text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={`Quantity for ${item.productName}`}
                  />
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    aria-label={`Increase quantity of ${item.productName}`}
                    disabled={item.quantity >= 100}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[120px]">
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  {item.isPreOrder && item.depositAmount && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Deposit: {formatCurrency(item.depositAmount * item.quantity)}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  aria-label={`Remove ${item.productName} from cart`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
          </div>

          {totalDeposit > 0 && (
            <div className="flex justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-slate-700 dark:text-slate-300">
                Pre-Order Deposit Required
              </span>
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(totalDeposit)}
              </span>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {showCheckoutButton && (
            <Button
              size="lg"
              className="w-full mt-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              onClick={onCheckout}
              aria-label="Proceed to checkout with your cart items"
            >
              Proceed to Checkout
            </Button>
          )}

          <Link href="/catalog">
            <Button 
              variant="outline" 
              className="w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              aria-label="Continue shopping in the catalog"
            >
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
