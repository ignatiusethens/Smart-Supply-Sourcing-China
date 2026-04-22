'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import {
  CheckoutForm,
  CheckoutFormData,
} from '@/components/buyer/CheckoutForm';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { authFetch } from '@/lib/api/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Redirect to cart if empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user ID from auth store
      const userId = user?.id;

      // Prepare order data
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        paymentMethod: formData.paymentMethod,
      };

      // Create order via API
      const response = await authFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear cart after successful order creation
      clearCart();

      // Redirect to payment page with order ID
      const orderId = result.data.id;
      const paymentMethod = formData.paymentMethod;

      if (paymentMethod === 'mpesa') {
        router.push(`/payment/mpesa?orderId=${orderId}`);
      } else {
        router.push(`/payment/bank-transfer?orderId=${orderId}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <BuyerLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your cart is empty
            </p>
            <Link href="/catalog">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link
                href="/catalog"
                className="hover:text-blue-600 transition-colors"
              >
                Catalog
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li
              className="text-slate-800 dark:text-slate-200 font-medium"
              aria-current="page"
            >
              Secure Checkout
            </li>
          </ol>
        </nav>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Two-column checkout layout */}
        <CheckoutForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </BuyerLayout>
  );
}
