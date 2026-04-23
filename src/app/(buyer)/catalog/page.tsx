'use client';

import React from 'react';
import Link from 'next/link';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { ProductGrid } from '@/components/buyer/ProductGrid';
import { FilterPanel } from '@/components/buyer/FilterPanel';
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
  const [mpesaReady, setMpesaReady] = React.useState(false);
  const [bankEligible, setBankEligible] = React.useState(false);

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
    handleFilterChange({ ...filters, availability: next ? ['in-stock'] : [] });
  };

  const handleBankEligibleToggle = () => {
    const next = !bankEligible;
    setBankEligible(next);
    setMpesaReady(false);
    handleFilterChange({
      ...filters,
      availability: next ? ['in-stock', 'pre-order'] : [],
    });
  };

  const totalResults = pagination?.total ?? products.length;

  return (
    <BuyerLayout>
      <div className="flex min-h-screen bg-[#f0faf6]">
        {/* ── Left Sidebar ── */}
        <aside
          className="w-64 flex-shrink-0 border-r border-gray-100 bg-white sticky top-16 self-start h-[calc(100vh-4rem)] overflow-hidden hidden lg:flex flex-col"
          aria-label="Product filters"
        >
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            priceRange={{ min: 0, max: 1000000 }}
          />
        </aside>

        {/* ── Main Content ── */}
        <main id="main-content" className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-100 px-6 py-5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs text-gray-400 mb-3"
            >
              <Link href="/" className="hover:text-[#1a6b50] transition-colors">
                Sourcing
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link
                href="/catalog"
                className="hover:text-[#1a6b50] transition-colors"
              >
                China Direct Catalog
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <span className="text-gray-600 font-medium">All Products</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  China Direct Inventory
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing{' '}
                  <span className="font-bold text-gray-700">
                    {totalResults} results
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Quick filter pills */}
                <button
                  onClick={handleMpesaReadyToggle}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    mpesaReady
                      ? 'bg-[#1a6b50] text-white border-[#1a6b50]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6b50] hover:text-[#1a6b50]'
                  }`}
                  aria-pressed={mpesaReady}
                >
                  📱 M-Pesa Ready
                </button>
                <button
                  onClick={handleBankEligibleToggle}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    bankEligible
                      ? 'bg-[#1a6b50] text-white border-[#1a6b50]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a6b50] hover:text-[#1a6b50]'
                  }`}
                  aria-pressed={bankEligible}
                >
                  🏦 Bank Eligible
                </button>

                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Search catalogue..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 h-8 w-48 text-xs border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                    aria-label="Search products"
                  />
                </div>

                {/* View toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#1a6b50] text-white'
                        : 'bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#1a6b50] text-white'
                        : 'bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Custom Sourcing CTA */}
                <Link
                  href="/sourcing/request"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a6b50] border border-[#1a6b50] px-3 py-1.5 rounded-lg hover:bg-[#e8f4f0] transition-colors"
                >
                  Custom Sourcing →
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile filter toggle */}
          <div className="lg:hidden px-4 pt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full py-2.5 text-sm font-semibold text-[#1a6b50] border border-[#1a6b50] rounded-xl hover:bg-[#e8f4f0] transition-colors"
              aria-expanded={showFilters}
              aria-controls="mobile-filter-panel"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            {showFilters && (
              <div
                id="mobile-filter-panel"
                className="mt-3 border border-gray-100 rounded-xl overflow-hidden bg-white"
              >
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  priceRange={{ min: 0, max: 1000000 }}
                />
              </div>
            )}
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
                className="flex flex-wrap items-center justify-center gap-2 mt-10"
                aria-label="Product pagination"
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-[#1a6b50] hover:text-[#1a6b50] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
                  aria-label="Previous page"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 text-sm font-semibold rounded-lg transition-colors ${
                          pageNum === page
                            ? 'bg-[#1a6b50] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a6b50] hover:text-[#1a6b50]'
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={pageNum === page ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === 2 ||
                    pageNum === pagination.totalPages - 1
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="text-gray-400 text-sm"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-[#1a6b50] hover:text-[#1a6b50] disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white"
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}

            {/* Load more hint */}
            {pagination && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Showing {products.length} of {totalResults} products
              </p>
            )}

            {error && (
              <div
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mt-4"
                role="alert"
              >
                Failed to load products. Please try again.
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <div className="mx-6 mb-8 rounded-2xl bg-[#1a6b50] px-8 py-10 text-white">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-xl font-black mb-2">
                  Direct Factory Access. Secure Local Payment.
                </h2>
                <p className="text-sm text-[#a8d5c4] leading-relaxed mb-4">
                  We connect global businesses with reliable Chinese
                  manufacturing and facilitate African business growth. Pay
                  securely in KES and track your supply chain end-to-end.
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#a8d5c4]">
                  <span>✓ Verified Manufacturers</span>
                  <span>✓ Local M-Pesa Integration</span>
                  <span>✓ Quality Assured</span>
                </div>
              </div>
              <div className="lg:text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#a8d5c4] mb-3">
                  Sourcing Consultation
                </p>
                <Link
                  href="/sourcing/request"
                  className="inline-flex items-center gap-2 bg-white text-[#1a6b50] font-bold px-6 py-3 rounded-xl hover:bg-[#e8f4f0] transition-colors text-sm"
                >
                  Request Sourcing →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </BuyerLayout>
  );
}
