'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { CartSummary } from '@/components/buyer/CartSummary';
import { useCartStore } from '@/lib/stores/cartStore';

export default function CartPage() {
  const router = useRouter();
  const { items } = useCartStore();

  const handleCheckout = () => {
    if (items.length > 0) {
      router.push('/checkout');
    }
  };

  return (
    <BuyerLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <CartSummary
          showCheckoutButton={true}
          onCheckout={handleCheckout}
        />
      </div>
    </BuyerLayout>
  );
}
