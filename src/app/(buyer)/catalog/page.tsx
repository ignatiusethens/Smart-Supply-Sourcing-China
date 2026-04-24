'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductFilters, Product } from '@/types';
import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  MapPin,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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
  color = '#f47a20',
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
    <div className="bg-white p-4 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow">
      <label className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
        <input className="w-3 h-3 rounded border-gray-300" type="checkbox" />
        Compare
      </label>

      <Link href={`/product/${product.id}`} className="block">
        <div className="bg-gray-100 flex-grow mb-4 relative min-h-[200px] flex items-center justify-center">
          {product.imageUrls?.[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Product Image</span>
            </div>
          )}
          {isInStock && (
            <span className="absolute bottom-2 left-2 bg-[#f47a20] text-[9px] text-white px-2 py-0.5 font-bold italic">
              TRENDING NOW
            </span>
          )}
        </div>
      </Link>

      <Link
        href={`/product/${product.id}`}
        className="hover:text-orange-500 transition-colors"
      >
        <h4 className="font-bold text-sm mb-1">{product.name}</h4>
      </Link>
      <div className="text-xs font-bold mb-1">
        KES {product.price.toLocaleString()}
      </div>
      <div className="text-[10px] text-gray-400 mb-2">
        MOQ: {product.stockLevel || 1} UNITS
      </div>

      <div className="mt-auto">
        <div className="mb-3 h-8">
          <MiniChart index={index} />
        </div>
        <button
          onClick={onRequestQuote}
          className="bg-[#f47a20] text-white text-xs font-bold py-2 w-full rounded hover:bg-orange-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    availability: [],
    priceRange: { min: 0, max: 1000000 },
    searchQuery: '',
  });
  const [page, setPage] = useState(1);
  const [shippingFilters, setShippingFilters] = useState<string[]>([]);

  // Fetch products from API
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
  const { data: userData } = useSWR('/api/auth/me', fetcher);

  const products: Product[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const categories: { slug: string; label: string }[] = catData?.data || [];
  const totalResults = pagination?.total ?? products.length;
  const user = userData?.user;

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

  const handleShippingFilter = (filter: string) => {
    setShippingFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-[#002d1a] text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex flex-col leading-tight min-w-max">
            <span className="text-2xl font-bold tracking-tight">
              Smart Supply
            </span>
            <span className="text-[10px] uppercase opacity-80 tracking-widest">
              Sourcing China
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl">
            <div className="relative flex">
              <input
                className="w-full py-2 px-4 rounded-l text-gray-800 focus:outline-none focus:ring-0 border-none"
                placeholder="Search for products, suppliers, categories..."
                type="text"
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters((p) => ({ ...p, searchQuery: e.target.value }));
                  setPage(1);
                }}
              />
              <button className="bg-gray-800 px-4 py-2 rounded-r flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="hover:text-gray-300 transition-colors"
            >
              Sourcing Dashboard
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Welcome, {user.name || user.email}</span>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Log In / Sign Up
              </Link>
            )}
            <Link href="/cart" className="bg-[#f47a20] p-2 rounded relative">
              <ShoppingCart className="w-5 h-5" fill="white" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sub Navigation */}
      <nav className="bg-[#002d1a] border-t border-green-900 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex gap-8">
          <div className="flex items-center gap-1 cursor-pointer">
            <span>Categories</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          {categories.slice(0, 3).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`hover:text-gray-200 transition-colors ${
                filters.categories.includes(cat.slug)
                  ? 'text-orange-300 font-bold'
                  : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            {/* Categories Section */}
            <div className="mb-8">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
                Categories
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => {
                      setFilters((p) => ({ ...p, categories: [] }));
                      setPage(1);
                    }}
                    className={`flex items-center gap-3 w-full text-left transition-colors ${
                      filters.categories.length === 0
                        ? 'text-[#002d1a] font-bold'
                        : 'text-gray-600 hover:text-green-800'
                    }`}
                  >
                    <div className="w-3 h-3 bg-gray-200"></div>
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex items-center gap-3 w-full text-left transition-colors ${
                        filters.categories.includes(cat.slug)
                          ? 'text-[#002d1a] font-bold'
                          : 'text-gray-600 hover:text-green-800'
                      }`}
                    >
                      <div className="w-3 h-3 bg-gray-200"></div>
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filters Section */}
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-t pt-4">
                Filters
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">
                  Price Range
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="KES 0"
                    type="text"
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
                  <input
                    className="w-1/2 text-xs border-gray-300 rounded p-1"
                    placeholder="KES 50,000+"
                    type="text"
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
                <div className="h-1 bg-gray-200 rounded relative">
                  <div className="absolute inset-y-0 left-0 right-1/4 bg-[#f47a20] rounded"></div>
                  <div className="absolute -top-1 right-1/4 w-3 h-3 bg-white border-2 border-orange-500 rounded-full"></div>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6 space-y-2">
                <button className="text-xs text-gray-600 flex items-center justify-between w-full hover:text-gray-800">
                  Price: Low to High
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button className="text-xs text-gray-600 flex items-center justify-between w-full hover:text-gray-800">
                  Price: High to Low
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Shipping Time */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">
                  Shipping Time
                </label>
                <div className="space-y-1">
                  {SHIPPING_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <input
                        className="rounded text-orange-500 focus:ring-orange-500 w-3 h-3"
                        type="checkbox"
                        checked={shippingFilters.includes(option)}
                        onChange={() => handleShippingFilter(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2">
                  Availability
                </label>
                <div className="space-y-1">
                  {[
                    {
                      value: 'in-stock' as const,
                      label: 'Ready Stock (M-Pesa)',
                    },
                    { value: 'pre-order' as const, label: 'Pre-order (Bank)' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <input
                        className="rounded text-orange-500 focus:ring-orange-500 w-3 h-3"
                        type="checkbox"
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

              {/* Shipping Origins */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold">
                    Shipping Origins
                  </label>
                  <button className="text-[10px] text-gray-400 hover:text-gray-600">
                    Show on Map
                  </button>
                </div>
                <div className="rounded overflow-hidden">
                  <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Section */}
          <section className="flex-grow">
            {/* Result count */}
            <p className="text-xs text-gray-500 mb-4">
              Showing{' '}
              <span className="font-bold text-gray-800">
                {totalResults} results
              </span>
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex justify-center items-center gap-4 text-xs font-medium text-gray-500 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="hover:text-gray-800 transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({
                    length: Math.min(pagination.totalPages, 5),
                  }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                          page === p
                            ? 'bg-[#002d1a] text-white'
                            : 'hover:bg-gray-200 text-gray-500 transition-colors'
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
                  className="hover:text-gray-800 transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#002d1a] text-white py-12 mt-12 border-t-4 border-orange-500">
        <div className="container mx-auto px-4 grid grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex flex-col leading-tight mb-6">
              <span className="text-xl font-bold">Smart Supply Sourcing</span>
              <span className="text-xl font-bold">China</span>
            </div>
            <div className="text-xs text-gray-400 space-y-4">
              <p>
                Garden Ravens Street, Mong Pang,
                <br />
                China, Guangdong, H1, 41200
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span>
                +81 0284601230
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span>
                support@smartsupply.com
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-sm mb-6">Services</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Electronics Online
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Textiles & Apparel
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Machinery & Tools
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Home & Garden
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm mb-6">Support</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Get Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-sm mb-6">Legal</h4>
            <ul className="text-xs text-gray-400 space-y-3">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Statement
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
          <p>Copyright @ Smart Supply Sourcing China</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">
              Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
