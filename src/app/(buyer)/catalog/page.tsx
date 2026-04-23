'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductFilters, Product } from '@/types';
import { Search } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SHIPPING_OPTIONS = [
  'Express (1-3 Days)',
  'Standard (7-14 Days)',
  'Air Freight (7-14 Days)',
  'Sea Freight (30-45 Days)',
];

// Mini sparkline chart — fixed path per index to avoid Math.random in render
const CHART_PATHS = [
  'M0 15 Q 10 5, 20 12 T 40 8 T 60 15 T 80 5 T 100 10',
  'M0 10 Q 20 18, 40 12 T 60 5 T 100 15',
  'M0 5 Q 30 15, 60 10 T 100 5',
  'M0 18 Q 50 2, 100 18',
  'M0 10 Q 50 18, 100 10',
];

function MiniChart({
  index = 0,
  color = '#f26522',
}: {
  index?: number;
  color?: string;
}) {
  const path = CHART_PATHS[index % CHART_PATHS.length];
  return (
    <svg className="w-full h-full" viewBox="0 0 100 20">
      <path d={path} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Product card matching the design
function CatalogProductCard({
  product,
  index,
  onRequestQuote,
}: {
  product: Product;
  index: number;
  onRequestQuote: () => void;
}) {
  const isInStock = product.availability === 'in-stock';
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col group">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
          Compare
        </label>
        {isInStock && (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            In Stock
          </span>
        )}
      </div>

      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square mb-5 relative flex items-center justify-center bg-gray-50 rounded overflow-hidden">
          {product.imageUrls?.[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <span className="text-5xl opacity-20">📦</span>
          )}
          <div className="absolute left-3 bottom-0 translate-y-1/2 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
            {isInStock
              ? 'Trending Now'
              : product.availability === 'pre-order'
                ? 'Pre-Order'
                : 'Out of Stock'}
          </div>
        </div>
      </Link>

      <Link
        href={`/product/${product.id}`}
        className="hover:text-orange-500 transition-colors"
      >
        <h3 className="text-sm font-bold mb-1 h-10 overflow-hidden leading-tight">
          {product.name}
        </h3>
      </Link>
      <div className="text-base font-extrabold mb-1">
        KES {product.price.toLocaleString()}
      </div>
      <div className="text-[10px] text-gray-400 mb-3 uppercase tracking-tighter">
        MOQ: {product.stockLevel ?? 1} Units
      </div>

      <div className="mt-auto">
        <div className="mb-3 h-8">
          <MiniChart index={index} />
        </div>
        <button
          onClick={onRequestQuote}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-bold text-sm transition-colors"
        >
          Request Quote
        </button>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [filters, setFilters] = React.useState<ProductFilters>({
    categories: [],
    availability: [],
    priceRange: { min: 0, max: 1000000 },
    searchQuery: '',
  });
  const [page, setPage] = React.useState(1);
  const [shippingFilters, setShippingFilters] = React.useState<string[]>([]);

  const queryParams = new URLSearchParams();
  filters.categories.forEach((cat) => queryParams.append('categories', cat));
  filters.availability.forEach((avail) =>
    queryParams.append('availability', avail)
  );
  queryParams.append('minPrice', filters.priceRange.min.toString());
  queryParams.append('maxPrice', filters.priceRange.max.toString());
  if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
  queryParams.append('page', page.toString());
  queryParams.append('limit', '9');

  const { data, isLoading, error } = useSWR(
    `/api/products?${queryParams.toString()}`,
    fetcher
  );
  const { data: catData } = useSWR('/api/admin/categories', fetcher);

  const products: Product[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const categories: { slug: string; label: string }[] = catData?.data || [];
  const totalResults = pagination?.total ?? products.length;

  const handleCategoryClick = (slug: string) => {
    const already = filters.categories.includes(slug);
    setFilters((prev) => ({
      ...prev,
      categories: already
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug],
    }));
    setPage(1);
  };

  const handleRequestQuote = () => {
    window.location.href = `/sourcing/request`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="text-3xl font-bold text-[#1a4d2e] flex items-center">
              <span className="mr-1">S</span>
              <div className="leading-tight text-sm">
                <div className="font-bold text-lg tracking-tight">
                  Smart Supply
                </div>
                <div className="text-gray-500 font-medium text-[10px] uppercase">
                  Sourcing China
                </div>
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl px-8">
            <div className="relative flex items-center">
              <input
                className="w-full h-10 pl-4 pr-12 rounded-md border border-gray-300 focus:ring-1 focus:ring-green-800 focus:border-green-800 outline-none text-sm"
                placeholder="Search for products, suppliers, categories..."
                type="text"
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, searchQuery: e.target.value }));
                  setPage(1);
                }}
              />
              <button className="absolute right-0 top-0 h-10 w-12 bg-[#1a4d2e] rounded-r-md flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium hover:text-green-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Log In / Sign Up
            </Link>
            <Link
              href="/cart"
              className="relative bg-orange-500 p-2 rounded-md"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Nav bar */}
        <div className="flex justify-center pb-4 bg-white">
          <div className="bg-[#1a4d2e] rounded-lg flex items-center h-10 text-white">
            <button className="bg-white/10 h-full px-4 flex items-center gap-2 font-medium hover:bg-white/20 transition-colors rounded-l-lg text-sm">
              Categories
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <nav className="flex items-center gap-6 px-6 text-sm font-medium">
              {categories.slice(0, 3).map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`hover:text-gray-200 transition-colors ${filters.categories.includes(cat.slug) ? 'text-orange-300 font-bold' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 py-4" id="main-content">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-gray-500 mb-6 gap-2">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">Product Catalog</span>
        </nav>

        <div className="flex gap-8">
          {/* ── SIDEBAR ── */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            {/* Categories */}
            <section className="mb-8">
              <h2 className="text-sm font-bold text-[#1a4d2e] mb-4 uppercase tracking-wider">
                Categories
              </h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => {
                      setFilters((p) => ({ ...p, categories: [] }));
                      setPage(1);
                    }}
                    className={`flex items-center gap-3 w-full text-left transition-colors ${filters.categories.length === 0 ? 'text-[#1a4d2e] font-bold' : 'text-gray-600 hover:text-green-800'}`}
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex items-center gap-3 w-full text-left transition-colors ${filters.categories.includes(cat.slug) ? 'text-[#1a4d2e] font-bold' : 'text-gray-600 hover:text-green-800'}`}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Filters */}
            <section>
              <h2 className="text-sm font-bold text-[#1a4d2e] mb-4 uppercase tracking-wider">
                Filters
              </h2>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-xs font-bold mb-2">Price Range</h3>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    className="w-full text-[10px] border border-gray-300 rounded p-1"
                    type="text"
                    placeholder="KES 0"
                    value={
                      filters.priceRange.min > 0
                        ? `KES ${filters.priceRange.min.toLocaleString()}`
                        : ''
                    }
                    onChange={(e) => {
                      const val =
                        parseInt(e.target.value.replace(/\D/g, '')) || 0;
                      setFilters((p) => ({
                        ...p,
                        priceRange: { ...p.priceRange, min: val },
                      }));
                    }}
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    className="w-full text-[10px] border border-gray-300 rounded p-1"
                    type="text"
                    placeholder="KES 50,000+"
                    value={
                      filters.priceRange.max < 1000000
                        ? `KES ${filters.priceRange.max.toLocaleString()}`
                        : ''
                    }
                    onChange={(e) => {
                      const val =
                        parseInt(e.target.value.replace(/\D/g, '')) || 1000000;
                      setFilters((p) => ({
                        ...p,
                        priceRange: { ...p.priceRange, max: val },
                      }));
                    }}
                  />
                </div>
                <div className="relative h-1 bg-gray-200 rounded-full">
                  <div className="absolute h-1 bg-green-800 w-full rounded-full" />
                  <div className="absolute -top-1.5 left-0 w-4 h-4 bg-white border-2 border-green-800 rounded-full cursor-pointer" />
                  <div className="absolute -top-1.5 right-0 w-4 h-4 bg-white border-2 border-green-800 rounded-full cursor-pointer" />
                </div>
              </div>

              {/* Shipping Time */}
              <div className="mb-6">
                <h3 className="text-xs font-bold mb-3">Shipping Time</h3>
                <div className="space-y-2 text-xs">
                  {SHIPPING_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-green-800 focus:ring-green-800"
                        checked={shippingFilters.includes(opt)}
                        onChange={() =>
                          setShippingFilters((p) =>
                            p.includes(opt)
                              ? p.filter((o) => o !== opt)
                              : [...p, opt]
                          )
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h3 className="text-xs font-bold mb-3">Availability</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { value: 'in-stock', label: 'Ready Stock (M-Pesa)' },
                    { value: 'pre-order', label: 'Pre-order (Bank)' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-green-800 focus:ring-green-800"
                        checked={filters.availability.includes(opt.value)}
                        onChange={() => {
                          const already = filters.availability.includes(
                            opt.value
                          );
                          setFilters((p) => ({
                            ...p,
                            availability: already
                              ? p.availability.filter((a) => a !== opt.value)
                              : [...p.availability, opt.value],
                          }));
                          setPage(1);
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1">
            {/* Result count */}
            <p className="text-xs text-gray-500 mb-4">
              Showing{' '}
              <span className="font-bold text-gray-800">
                {totalResults} results
              </span>
            </p>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 rounded mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-5xl mb-3">📦</p>
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onRequestQuote={handleRequestQuote}
                  />
                ))}
              </div>
            )}

            {error && (
              <div
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mt-4"
                role="alert"
              >
                Failed to load products. Please try again.
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="text-gray-500 hover:text-green-800 font-medium disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({
                    length: Math.min(pagination.totalPages, 5),
                  }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                          page === p
                            ? 'bg-[#1a4d2e] text-white'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-gray-500 hover:text-green-800 font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a4d2e] text-white mt-16 pt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 pb-12">
          <div>
            <div className="text-xl font-bold mb-6">
              Smart Supply Sourcing China
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Kenya&apos;s trusted B2B gateway for sourcing quality products
              from China. Fast, secure, and logistics-ready.
            </p>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">📍 Nairobi, Kenya</div>
              <div className="flex items-center gap-2">
                ✉️ hello@smartsupply.com
              </div>
              <div className="flex items-center gap-2">📞 +254 700 000 000</div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Services</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              {[
                'Product Catalog',
                'Custom Sourcing',
                'Order Management',
                'Payment Solutions',
              ].map((l) => (
                <li key={l}>
                  <Link
                    href="/catalog"
                    className="hover:text-orange-400 transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              {[
                'Help Center',
                'Contact Us',
                'Shipping Info',
                'Returns Policy',
              ].map((l) => (
                <li key={l}>
                  <Link
                    href="/"
                    className="hover:text-orange-400 transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              {[
                'Privacy Policy',
                'Terms of Service',
                'Compliance',
                'Security',
              ].map((l) => (
                <li key={l}>
                  <Link
                    href="/"
                    className="hover:text-orange-400 transition-colors"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[10px] text-gray-400">
            <div>
              Copyright © {new Date().getFullYear()} Smart Supply Sourcing China
            </div>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/" className="hover:text-white">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
