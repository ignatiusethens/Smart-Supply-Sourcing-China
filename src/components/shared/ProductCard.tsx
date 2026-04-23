'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';
import { ShoppingCart, FileText } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
  onRequestQuote?: (productId: string) => void;
  variant?: 'grid' | 'list';
}

const CATEGORY_LABELS: Record<string, string> = {
  'pumps-motors': 'Pumps & Motors',
  'energy-systems': 'Energy Systems',
  'fluid-control': 'Fluid Control',
  electrical: 'Electrical',
  storage: 'Storage',
};

function getAvailabilityBadge(availability: string) {
  switch (availability) {
    case 'in-stock':
      return {
        label: 'In Stock',
        className: 'bg-green-50 text-green-700 border border-green-200',
      };
    case 'pre-order':
      return {
        label: 'Pre-Order',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      };
    case 'out-of-stock':
      return {
        label: 'Out of Stock',
        className: 'bg-red-50 text-red-600 border border-red-200',
      };
    default:
      return { label: availability, className: 'bg-gray-100 text-gray-600' };
  }
}

function supportsMpesa(availability: string) {
  return availability === 'in-stock';
}

function supportsBank(availability: string) {
  return availability === 'in-stock' || availability === 'pre-order';
}

export function ProductCard({
  product,
  onAddToCart,
  onRequestQuote,
  variant = 'grid',
}: ProductCardProps) {
  const [quantity] = React.useState(1);
  const isOutOfStock = product.availability === 'out-of-stock';
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const availBadge = getAvailabilityBadge(product.availability);

  if (variant === 'list') {
    return (
      <div className="flex flex-col sm:flex-row overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#1a6b50]">
        {/* Image — links to product detail */}
        <Link
          href={`/product/${product.id}`}
          className="relative block w-full sm:w-36 h-44 sm:h-auto flex-shrink-0 bg-gray-100 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden"
          tabIndex={-1}
        >
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={`${product.name} - ${categoryLabel}`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-20">📦</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a6b50]">
              {categoryLabel}
            </span>
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                availBadge.className
              )}
            >
              {availBadge.label}
            </span>
          </div>
          <Link
            href={`/product/${product.id}`}
            className="hover:text-[#1a6b50] transition-colors"
          >
            <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 mb-0.5">Unit Price</p>
              <p className="font-black text-lg text-[#1a6b50]">
                {formatCurrency(product.price)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {supportsMpesa(product.availability) && (
                  <span className="text-[10px] text-gray-400">📱 M-Pesa</span>
                )}
                {supportsBank(product.availability) && (
                  <span className="text-[10px] text-gray-400">🏦 Bank</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isOutOfStock && onAddToCart && (
                <button
                  onClick={() => onAddToCart(product.id, quantity)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a6b50] hover:bg-[#155a42] text-white text-xs font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50]"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                  Add to Cart
                </button>
              )}
              {onRequestQuote && (
                <button
                  onClick={() => onRequestQuote(product.id)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:border-[#1a6b50] hover:text-[#1a6b50] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50]"
                  aria-label={`Request quote for ${product.name}`}
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  Request Quote
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-white border border-gray-100 rounded-2xl',
        'shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-[#1a6b50]'
      )}
    >
      {/* Image — links to product detail */}
      <Link
        href={`/product/${product.id}`}
        className="relative block w-full h-44 bg-gray-100 overflow-hidden"
        tabIndex={-1}
      >
        {/* Payment badges */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {supportsMpesa(product.availability) && (
            <span className="inline-flex items-center rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              M-PESA INSTANT
            </span>
          )}
          {supportsBank(product.availability) &&
            !supportsMpesa(product.availability) && (
              <span className="inline-flex items-center rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                BANK 1-3 DAYS
              </span>
            )}
        </div>

        {product.imageUrls[0] ? (
          <Image
            src={product.imageUrls[0]}
            alt={`${product.name} - ${categoryLabel}`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl opacity-20">📦</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pt-4 pb-3">
        {/* Category + availability */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a6b50]">
            {categoryLabel}
          </span>
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
              availBadge.className
            )}
          >
            {availBadge.label}
          </span>
        </div>

        {/* Name — links to product detail */}
        <Link
          href={`/product/${product.id}`}
          className="hover:text-[#1a6b50] transition-colors"
        >
          <h3 className="font-bold text-sm text-gray-900 mb-3 line-clamp-2 leading-snug flex-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 mb-0.5">Unit Price</p>
          <p className="font-black text-xl text-[#1a6b50]">
            {formatCurrency(product.price)}
          </p>
          {product.depositAmount && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Deposit: {formatCurrency(product.depositAmount)}
            </p>
          )}
        </div>

        {/* Payment indicators */}
        <div className="flex items-center gap-3 mb-3">
          {supportsMpesa(product.availability) && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span aria-hidden="true">📱</span> M-Pesa
            </span>
          )}
          {supportsBank(product.availability) && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span aria-hidden="true">🏦</span> Bank
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100 pt-3">
        {!isOutOfStock && onAddToCart && (
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a6b50] hover:bg-[#155a42] text-white text-xs font-bold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50] focus-visible:ring-offset-2"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id, quantity)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
            Add to Cart
          </button>
        )}
        {onRequestQuote && (
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:border-[#1a6b50] hover:text-[#1a6b50] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50] focus-visible:ring-offset-2"
            onClick={() => onRequestQuote(product.id)}
            aria-label={`Request quote for ${product.name}`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            Request Quote
          </button>
        )}
      </div>
    </div>
  );
}
