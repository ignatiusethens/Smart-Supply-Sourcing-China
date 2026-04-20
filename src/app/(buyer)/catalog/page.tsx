'use client';

import React from 'react';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { ProductGrid } from '@/components/buyer/ProductGrid';
import { FilterPanel } from '@/components/buyer/FilterPanel';
import { Button } from '@/components/ui/button';
import { ProductFilters, Product } from '@/types';
import { LayoutGrid, List } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CatalogPage() {
  const [filters, setFilters] = React.useState<ProductFilters>({
    categories: [],
    availability: [],
    priceRange: { min: 0, max: 1000000 },
    searchQuery: '',
  });

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [page, setPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);

  // Build query string
  const queryParams = new URLSearchParams();
  filters.categories.forEach(cat => queryParams.append('categories', cat));
  filters.availability.forEach(avail => queryParams.append('availability', avail));
  queryParams.append('minPrice', filters.priceRange.min.toString());
  queryParams.append('maxPrice', filters.priceRange.max.toString());
  if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
  queryParams.append('page', page.toString());
  queryParams.append('limit', '20');

  const { data, isLoading, error } = useSWR(
    `/api/products?${queryParams.toString()}`,
    fetcher
  );

  const products: Product[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleRequestQuote = (productId: string) => {
    // TODO: Implement quote request flow
    console.log('Request quote for product:', productId);
  };

  return (
    <BuyerLayout>
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Product Catalog</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Browse our selection of industrial equipment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <aside className="lg:col-span-1">
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filter panel */}
          <div
            id="filter-panel"
            className={`${showFilters ? 'block' : 'hidden'} lg:block`}
          >
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              priceRange={{ min: 0, max: 1000000 }}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3">
          {/* View mode toggle and results info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {pagination && (
                <>
                  Showing {(page - 1) * 20 + 1} to{' '}
                  {Math.min(page * 20, pagination.total)} of {pagination.total}{' '}
                  products
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Switch to grid view"
                className="focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="Switch to list view"
                className="focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Products */}
          <ProductGrid
            products={products}
            variant={viewMode}
            onRequestQuote={handleRequestQuote}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav 
              className="flex flex-wrap items-center justify-center gap-2 mt-8"
              aria-label="Product pagination"
            >
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Previous page"
              >
                Previous
              </Button>

              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      onClick={() => setPage(pageNum)}
                      className="focus-visible:ring-2 focus-visible:ring-offset-2"
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={pageNum === page ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  pageNum === 2 ||
                  pageNum === pagination.totalPages - 1
                ) {
                  return <span key={pageNum} aria-hidden="true">...</span>;
                }
                return null;
              })}

              <Button
                variant="outline"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Next page"
              >
                Next
              </Button>
            </nav>
          )}

          {error && (
            <div 
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm"
              role="alert"
            >
              Failed to load products. Please try again.
            </div>
          )}
        </main>
      </div>
    </BuyerLayout>
  );
}