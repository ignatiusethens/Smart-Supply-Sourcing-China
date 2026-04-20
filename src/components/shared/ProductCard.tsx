'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils/cn';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
  onRequestQuote?: (productId: string) => void;
  variant?: 'grid' | 'list';
}

export function ProductCard({
  product,
  onAddToCart,
  onRequestQuote,
  variant = 'grid',
}: ProductCardProps) {
  const [quantity, setQuantity] = React.useState(1);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'success';
      case 'pre-order':
        return 'warning';
      case 'out-of-stock':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'In Stock';
      case 'pre-order':
        return 'Pre-Order';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return availability;
    }
  };

  const isOutOfStock = product.availability === 'out-of-stock';

  if (variant === 'list') {
    return (
      <Card className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
        <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
          {product.imageUrls[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={`${product.name} - ${product.category.replace('-', ' ')} product image`}
              fill
              className="object-cover"
            />
          ) : (
            <div 
              className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
              role="img"
              aria-label={`No image available for ${product.name}`}
            >
              <span className="text-slate-400 text-sm" aria-hidden="true">No image available</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <CardContent className="flex-1 pt-4 sm:pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-base sm:text-lg">{product.name}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
              </div>
              <Badge 
                variant={getAvailabilityColor(product.availability)}
                className="whitespace-nowrap"
              >
                {getAvailabilityLabel(product.availability)}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {product.description}
            </p>
          </CardContent>
          <CardFooter className="border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
            <div className="text-lg sm:text-xl font-bold">
              {formatCurrency(product.price)}
            </div>
            <div className="w-full sm:w-auto flex gap-2">
              {!isOutOfStock && onAddToCart && (
                <Button
                  size="sm"
                  onClick={() => onAddToCart(product.id, quantity)}
                  className="flex-1 sm:flex-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={`Add ${product.name} to cart`}
                >
                  Add to Cart
                </Button>
              )}
              {onRequestQuote && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRequestQuote(product.id)}
                  className="flex-1 sm:flex-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={`Request quote for ${product.name}`}
                >
                  Request Quote
                </Button>
              )}
            </div>
          </CardFooter>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
      <div className="relative w-full h-40 sm:h-48 bg-slate-200 dark:bg-slate-700">
        {product.imageUrls[0] ? (
          <Image
            src={product.imageUrls[0]}
            alt={`${product.name} - ${product.category.replace('-', ' ')} product image`}
            fill
            className="object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            role="img"
            aria-label={`No image available for ${product.name}`}
          >
            <span className="text-slate-400 text-sm" aria-hidden="true">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={getAvailabilityColor(product.availability)}
            className="text-xs"
            aria-label={`Product availability: ${getAvailabilityLabel(product.availability)}`}
          >
            {getAvailabilityLabel(product.availability)}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-1 pt-3 sm:pt-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">{product.category}</p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 sm:mb-4">
          {product.description}
        </p>

        {product.specifications.length > 0 && (
          <div className="mb-3 sm:mb-4 space-y-1">
            {product.specifications.slice(0, 2).map((spec) => (
              <div key={spec.id} className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{spec.label}:</span> {spec.value}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t flex flex-col gap-3 pt-3">
        <div className="w-full text-xl sm:text-2xl font-bold">
          {formatCurrency(product.price)}
        </div>

        {product.depositAmount && (
          <div className="w-full text-xs text-slate-500 dark:text-slate-400">
            Deposit: {formatCurrency(product.depositAmount)}
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-2">
          {!isOutOfStock && onAddToCart && (
            <Button
              className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product.id, quantity)}
              aria-label={`Add ${product.name} to cart`}
            >
              Add to Cart
            </Button>
          )}
          {onRequestQuote && (
            <Button
              className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2"
              variant="outline"
              onClick={() => onRequestQuote(product.id)}
              aria-label={`Request quote for ${product.name}`}
            >
              Quote
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}