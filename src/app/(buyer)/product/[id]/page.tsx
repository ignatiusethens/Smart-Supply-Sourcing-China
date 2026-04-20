'use client';

import React from 'react';
import Image from 'next/image';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Product } from '@/types';
import useSWR from 'swr';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [id, setId] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState(1);
  const addItem = useCartStore((state) => state.addItem);

  React.useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const { data, isLoading, error } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher
  );

  const product: Product = data?.data;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      // TODO: Show toast notification
    }
  };

  const handleRequestQuote = () => {
    // TODO: Implement quote request flow
    console.log('Request quote for product:', product?.id);
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-slate-200 rounded-lg" />
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-1/3" />
        </div>
      </BuyerLayout>
    );
  }

  if (error || !product) {
    return (
      <BuyerLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Product not found</p>
          <Link href="/catalog">
            <Button>Back to Catalog</Button>
          </Link>
        </div>
      </BuyerLayout>
    );
  }

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

  return (
    <BuyerLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/catalog" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative w-full h-96 bg-slate-200 rounded-lg overflow-hidden mb-4">
            {product.imageUrls[0] ? (
              <Image
                src={product.imageUrls[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-400">No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail gallery */}
          {product.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-full h-20 bg-slate-200 rounded cursor-pointer">
                  <Image
                    src={url}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <Badge variant={getAvailabilityColor(product.availability) as any}>
                {getAvailabilityLabel(product.availability)}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400 capitalize">
              {product.category.replace('-', ' ')}
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="text-4xl font-bold">
              {formatCurrency(product.price)}
            </div>
            {product.depositAmount && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Deposit: {formatCurrency(product.depositAmount)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-slate-600 dark:text-slate-400">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.specifications.map((spec) => (
                    <div key={spec.id} className="flex justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {spec.label}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warranty */}
          {product.warrantyDuration && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{product.warrantyDuration}</p>
                  {product.warrantyTerms && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {product.warrantyTerms}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add to cart */}
          <div className="space-y-3 pt-4 border-t">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <label className="font-medium">Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-20"
                />
              </div>
            )}

            <div className="flex gap-3">
              {!isOutOfStock && (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleRequestQuote}
              >
                Request Quote
              </Button>
            </div>

            {isOutOfStock && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                This product is currently out of stock. You can request a quote for future availability.
              </div>
            )}
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}