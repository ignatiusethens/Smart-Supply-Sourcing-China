'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { CartSummary } from '@/components/buyer/CartSummary';
import { useCartStore } from '@/lib/stores/cartStore';
import { ChevronRight } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items } = useCartStore();

  const handleCheckout = () => {
    if (items.length > 0) router.push('/checkout');
  };

  return (
    <BuyerLayout>
      <div className="min-h-screen bg-[#f0faf6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-gray-400 mb-6"
          >
            <Link
              href="/catalog"
              className="hover:text-[#1a6b50] transition-colors"
            >
              Catalog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600 font-medium">Shopping Cart</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <CartSummary showCheckoutButton onCheckout={handleCheckout} />
        </div>
      </div>
    </BuyerLayout>
  );
}
