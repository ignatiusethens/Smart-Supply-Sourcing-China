'use client';

import React from 'react';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { ProductGrid } from '@/components/buyer/ProductGrid';
import { FilterPanel } from '@/components/buyer/FilterPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductFilters, Product } from '@/types';
import { LayoutGrid, List, Search, ChevronRight } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const [selectAll, setSelectAll] = React.useState(false);
  const [mpesaReady, setMpesaReady] = React.useState(false);
  const [bankEligible, setBankEligible] = React.useState(false);

  // Build query string
  const queryParams = new URLSearchParams();
  filters.categories.forEach((cat) => queryParams.append('categories', cat));
  filters.availability.forEach((avail) =>
    queryParams.append('availability', avail)
  );
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
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setPage(1);
  };

  const handleRequestQuote = (productId: string) => {
    console.log('Request quote for product:', productId);
  };

  const handleMpesaReadyToggle = () => {
    const next = !mpesaReady;
    setMpesaReady(next);
    setBankEligible(false);
    if (next) {
      handleFilterChange({ ...filters, availability: ['in-stock'] });
    } else {
      handleFilterChange({ ...filters, availability: [] });
    }
  };

  const handleBankEligibleToggle = () => {
    const next = !bankEligible;
    setBankEligible(next);
    setMpesaReady(false);
    if (next) {
      handleFilterChange({
        ...filters,
        availability: ['in-stock', 'pre-order'],
      });
    } else {
      handleFilterChange({ ...filters, availability: [] });
    }
  };

  const totalResults = pagination?.total ?? products.length;

  return (
    <BuyerLayout>
      {/* Full-width catalog layout: sidebar + main */}
      <div className="flex min-h-screen">
        {/* ── Left Sidebar ── */}
        <aside
          className={`
            w-64 flex-shrink-0 border-r border-primary-200 bg-white
            sticky top-0 self-start h-screen overflow-hidden
            hidden lg:flex flex-col
          `}
          aria-label="Product filters"
        >
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            priceRange={{ min: 0, max: 1000000 }}
          />
        </aside>

        {/* ── Main Content ── */}
        <main id="main-content" className="flex-1 min-w-0 bg-primary-50">
          {/* Top bar: breadcrumb + title + search + view toggle */}
          <div className="bg-white border-b border-primary-200 px-6 py-4">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs text-primary-500 mb-2"
            >
              <span>Industrial Sourcing</span>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-primary-700 font-medium">All Products</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-primary-800">
                Product Catalog
              </h1>

              <div className="flex items-center gap-2">
                {/* Search input */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-9 w-56 text-sm border-primary-300 focus-visible:ring-info-500"
                    aria-label="Search products"
                  />
                </div>

                {/* View mode toggle */}
                <div className="flex border border-primary-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 ${
                      viewMode === 'grid'
                        ? 'bg-info-600 text-white'
                        : 'bg-white text-primary-500 hover:bg-primary-50'
                    }`}
                    title="Grid view"
                    aria-label="Switch to grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 ${
                      viewMode === 'list'
                        ? 'bg-info-600 text-white'
                        : 'bg-white text-primary-500 hover:bg-primary-50'
                    }`}
                    title="List view"
                    aria-label="Switch to list view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden px-4 pt-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full border-primary-300 text-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
              aria-expanded={showFilters}
              aria-controls="mobile-filter-panel"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            {showFilters && (
              <div
                id="mobile-filter-panel"
                className="mt-3 border border-primary-200 rounded-lg overflow-hidden"
              >
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  priceRange={{ min: 0, max: 1000000 }}
                />
              </div>
            )}
          </div>

          {/* Results bar */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-primary-200 bg-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
              Showing {totalResults} Result{totalResults !== 1 ? 's' : ''}
            </span>

            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {/* Select All Items */}
              <button
                onClick={() => setSelectAll(!selectAll)}
                className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 ${
                  selectAll
                    ? 'bg-info-600 text-white border-info-600'
                    : 'bg-white text-primary-600 border-primary-300 hover:bg-primary-50'
                }`}
                aria-pressed={selectAll}
                aria-label="Select all items"
              >
                Select All Items
              </button>

              {/* M-Pesa Ready badge */}
              <button
                onClick={handleMpesaReadyToggle}
                className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 ${
                  mpesaReady
                    ? 'bg-success-600 text-white border-success-600'
                    : 'bg-white text-primary-600 border-primary-300 hover:bg-primary-50'
                }`}
                aria-pressed={mpesaReady}
                aria-label="Filter by M-Pesa ready products"
              >
                📱 M-Pesa Ready
              </button>

              {/* Bank Eligible badge */}
              <button
                onClick={handleBankEligibleToggle}
                className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 ${
                  bankEligible
                    ? 'bg-info-600 text-white border-info-600'
                    : 'bg-white text-primary-600 border-primary-300 hover:bg-primary-50'
                }`}
                aria-pressed={bankEligible}
                aria-label="Filter by bank eligible products"
              >
                🏦 Bank Eligible
              </button>
            </div>
          </div>

          {/* Product grid */}
          <div className="px-6 py-6">
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
                  className="border-primary-300 text-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
                  aria-label="Previous page"
                >
                  Previous
                </Button>

                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pageNum = i + 1;
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
                        className={
                          pageNum === page
                            ? 'bg-info-600 hover:bg-info-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500'
                            : 'border-primary-300 text-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500'
                        }
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
                    return (
                      <span
                        key={pageNum}
                        className="text-primary-400"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border-primary-300 text-primary-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-500"
                  aria-label="Next page"
                >
                  Next
                </Button>
              </nav>
            )}

            {error && (
              <div
                className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm mt-4"
                role="alert"
              >
                Failed to load products. Please try again.
              </div>
            )}
          </div>
        </main>
      </div>
    </BuyerLayout>
  );
}
