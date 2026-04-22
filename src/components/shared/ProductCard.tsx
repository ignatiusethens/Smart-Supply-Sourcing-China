'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';

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
        className: 'bg-success-50 text-success-700 border border-success-500',
      };
    case 'pre-order':
      return {
        label: 'Pre-Order',
        className: 'bg-warning-50 text-warning-700 border border-warning-500',
      };
    case 'out-of-stock':
      return {
        label: 'Out of Stock',
        className: 'bg-error-50 text-error-700 border border-error-500',
      };
    default:
      return {
        label: availability,
        className: 'bg-primary-100 text-primary-700',
      };
  }
}

// Whether the product supports M-Pesa (in-stock items)
function supportsMpesa(availability: string) {
  return availability === 'in-stock';
}

// Whether the product supports Bank transfer (pre-order or in-stock)
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
      <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
        <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={`${product.name} - ${categoryLabel} product image`}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-primary-100 flex items-center justify-center"
              role="img"
              aria-label={`No image available for ${product.name}`}
            >
              <span className="text-primary-400 text-sm" aria-hidden="true">
                No image
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <CardContent className="flex-1 pt-4 sm:pt-3 pb-2">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                {categoryLabel}
              </span>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                  availBadge.className
                )}
                aria-label={`Product availability: ${availBadge.label}`}
              >
                {availBadge.label}
              </span>
            </div>
            <h3 className="font-semibold text-base text-primary-800 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-primary-500 line-clamp-2">
              {product.description}
            </p>
          </CardContent>
          <CardFooter className="border-t border-primary-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
            <div>
              <p className="text-xs text-primary-500 mb-0.5">Unit Price</p>
              <p className="font-bold text-xl text-primary-800">
                {formatCurrency(product.price)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {supportsMpesa(product.availability) && (
                  <span
                    className="text-xs text-primary-500"
                    title="M-Pesa eligible"
                    aria-label="M-Pesa payment available"
                  >
                    📱 M-Pesa
                  </span>
                )}
                {supportsBank(product.availability) && (
                  <span
                    className="text-xs text-primary-500"
                    title="Bank transfer eligible"
                    aria-label="Bank transfer available"
                  >
                    🏦 Bank
                  </span>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              {!isOutOfStock && onAddToCart && (
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product.id, quantity)}
                  className="flex-1 sm:flex-none bg-info-600 hover:bg-info-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
                  aria-label={`Buy ${product.name}`}
                >
                  Buy
                </Button>
              )}
              {onRequestQuote && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRequestQuote(product.id)}
                  className="flex-1 sm:flex-none border-primary-300 text-primary-700 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
                  aria-label={`Request quote for ${product.name}`}
                >
                  Quote
                </Button>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>
    );
  }

  // Grid variant — matches PDF mockup page 2
  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden bg-white border border-primary-200 rounded-lg',
        'shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-info-500'
      )}
    >
      {/* Product image */}
      <div className="relative w-full h-40 bg-primary-100">
        {/* Payment badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
          {supportsMpesa(product.availability) && (
            <span className="inline-flex items-center gap-1 rounded-md bg-success-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
              M-PESA INSTANT
            </span>
          )}
          {supportsBank(product.availability) && (
            <span className="inline-flex items-center gap-1 rounded-md bg-info-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
              BANK 1-3 DAYS
            </span>
          )}
        </div>
        {product.imageUrls[0] ? (
          <Image
            src={product.imageUrls[0]}
            alt={`${product.name} - ${categoryLabel} product image`}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            role="img"
            aria-label={`No image available for ${product.name}`}
          >
            <span className="text-primary-400 text-sm" aria-hidden="true">
              No image available
            </span>
          </div>
        )}
      </div>

      <CardContent className="flex-1 pt-3 pb-2 px-4">
        {/* Category label + availability badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-500">
            {categoryLabel}
          </span>
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
              availBadge.className
            )}
            aria-label={`Product availability: ${availBadge.label}`}
          >
            {availBadge.label}
          </span>
        </div>

        {/* Product name */}
        <h3 className="font-bold text-sm text-primary-800 mb-3 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Unit price */}
        <div className="mb-3">
          <p className="text-xs text-primary-500 mb-0.5">Unit Price</p>
          <p className="font-bold text-xl text-primary-800">
            {formatCurrency(product.price)}
          </p>
          {product.depositAmount && (
            <p className="text-xs text-primary-400 mt-0.5">
              Deposit: {formatCurrency(product.depositAmount)}
            </p>
          )}
        </div>

        {/* Payment method indicators */}
        <div className="flex items-center gap-3">
          {supportsMpesa(product.availability) && (
            <span
              className="flex items-center gap-1 text-xs text-primary-500"
              title="M-Pesa eligible"
              aria-label="M-Pesa payment available"
            >
              <span aria-hidden="true">📱</span>
              <span>M-Pesa</span>
            </span>
          )}
          {supportsBank(product.availability) && (
            <span
              className="flex items-center gap-1 text-xs text-primary-500"
              title="Bank transfer eligible"
              aria-label="Bank transfer available"
            >
              <span aria-hidden="true">🏦</span>
              <span>Bank</span>
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-primary-200 flex flex-col gap-2 pt-3 pb-3 px-4">
        {!isOutOfStock && onAddToCart && (
          <Button
            className="w-full bg-info-600 hover:bg-info-700 text-white font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id, quantity)}
            aria-label={`Buy ${product.name}`}
          >
            Buy
          </Button>
        )}
        {onRequestQuote && (
          <Button
            className="w-full border-primary-300 text-primary-700 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
            variant="outline"
            onClick={() => onRequestQuote(product.id)}
            aria-label={`Request quote for ${product.name}`}
          >
            Quote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
