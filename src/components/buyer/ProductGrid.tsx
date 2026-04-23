'use client';

import React, { useRef, useEffect } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { useCartStore } from '@/lib/stores/cartStore';
import {
  useAnnouncer,
  useKeyboardNavigation,
} from '@/lib/hooks/useAccessibility';

interface ProductGridProps {
  products: Product[];
  variant?: 'grid' | 'list';
  onRequestQuote?: (productId: string) => void;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  variant = 'grid',
  onRequestQuote,
  isLoading = false,
}: ProductGridProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { announce } = useAnnouncer();
  const gridRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product, quantity);
      announce(`Added ${quantity} ${product.name} to cart`, 'polite');
    }
  };

  const handleRequestQuote = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product && onRequestQuote) {
      onRequestQuote(productId);
      announce(`Quote requested for ${product.name}`, 'polite');
    }
  };

  // Set up keyboard navigation for product cards
  useEffect(() => {
    if (!gridRef.current) return;

    const productCards = Array.from(
      gridRef.current.querySelectorAll('[data-product-card]')
    ) as HTMLElement[];

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const currentCard = target.closest('[data-product-card]') as HTMLElement;

      if (!currentCard) return;

      const currentIndex = productCards.indexOf(currentCard);
      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % productCards.length;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex =
            (currentIndex - 1 + productCards.length) % productCards.length;
          break;
        case 'ArrowDown':
          if (variant === 'grid') {
            e.preventDefault();
            // Calculate columns based on screen size
            const cols =
              window.innerWidth >= 1920
                ? 4
                : window.innerWidth >= 1024
                  ? 3
                  : window.innerWidth >= 768
                    ? 2
                    : 1;
            nextIndex = Math.min(currentIndex + cols, productCards.length - 1);
          }
          break;
        case 'ArrowUp':
          if (variant === 'grid') {
            e.preventDefault();
            const cols =
              window.innerWidth >= 1920
                ? 4
                : window.innerWidth >= 1024
                  ? 3
                  : window.innerWidth >= 768
                    ? 2
                    : 1;
            nextIndex = Math.max(currentIndex - cols, 0);
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = productCards.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        const nextCard = productCards[nextIndex];
        const focusableElement = nextCard.querySelector(
          'button, a, [tabindex="0"]'
        ) as HTMLElement;
        if (focusableElement) {
          focusableElement.focus();
        }
      }
    };

    gridRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      if (gridRef.current) {
        gridRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [products, variant]);

  // Responsive grid classes
  // Mobile: 1 column
  // Tablet (768px): 2 columns
  // Desktop (1024px): 3 columns
  // Large Desktop (1920px): 4 columns
  const gridClasses =
    variant === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 desktop:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6'
      : 'space-y-3 sm:space-y-4 md:space-y-5';

  if (isLoading) {
    return (
      <div
        className={gridClasses}
        role="status"
        aria-label="Loading products"
        aria-live="polite"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-2xl h-72 animate-pulse"
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="text-center py-12 px-4 sm:py-16 md:py-20"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-500 text-base sm:text-lg">
          No products found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className={gridClasses}
      role="region"
      aria-label={`Product list with ${products.length} products`}
      aria-describedby="product-grid-instructions"
    >
      <div id="product-grid-instructions" className="sr-only">
        Use arrow keys to navigate between products. Press Enter or Space to
        interact with buttons.
        {variant === 'grid' &&
          ' Use up and down arrows to navigate between rows.'}
      </div>
      {products.map((product, index) => (
        <div key={product.id} data-product-card data-product-index={index}>
          <ProductCard
            product={product}
            variant={variant}
            onAddToCart={handleAddToCart}
            onRequestQuote={handleRequestQuote}
          />
        </div>
      ))}
    </div>
  );
}
