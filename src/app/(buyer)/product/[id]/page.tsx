'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Product } from '@/types';
import useSWR from 'swr';
import {
  ChevronRight,
  ShoppingCart,
  FileText,
  Shield,
  Truck,
  Lock,
  Minus,
  Plus,
  AlertTriangle,
  Star,
  Package,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

const TABS = [
  'Product Details',
  'Specifications',
  'Shipping & Delivery',
  'Vendor Info',
];

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [id, setId] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState(0);
  const addItem = useCartStore((state) => state.addItem);

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading, error } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher
  );
  const { data: relatedData } = useSWR(
    id ? `/api/products?limit=4` : null,
    fetcher
  );

  const product: Product = data?.data;
  const relatedProducts: Product[] = (relatedData?.data?.data || [])
    .filter((p: Product) => p.id !== id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (product) addItem(product, quantity);
  };
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQuantity = () => setQuantity((q) => Math.min(100, q + 1));

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="min-h-screen bg-[#f0faf6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-3">
                <div className="h-80 bg-gray-200 rounded-2xl" />
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-10 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded-2xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <BuyerLayout>
        <div className="min-h-screen bg-[#f0faf6] flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-gray-800 font-bold text-lg mb-2">
              Product not found
            </p>
            <p className="text-gray-500 text-sm mb-6">
              This product doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-[#1a6b50] hover:bg-[#155a42] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  const isPreOrder = product.availability === 'pre-order';
  const isOutOfStock = product.availability === 'out-of-stock';
  const isInStock = product.availability === 'in-stock';
  const depositAmount =
    product.depositAmount ?? (isPreOrder ? product.price * 0.3 : null);
  const depositPercent = depositAmount
    ? Math.round((depositAmount / product.price) * 100)
    : 30;
  const categoryLabel = product.category
    ? product.category
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Products';
  const images = product.imageUrls?.length ? product.imageUrls : [];
  const mainImage = images[selectedImageIndex] ?? null;
  const skuDisplay = `SSC-${product.id?.slice(0, 8).toUpperCase() ?? 'N/A'}`;

  return (
    <BuyerLayout>
      <div className="min-h-screen bg-[#f0faf6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-gray-400 mb-6"
          >
            <Link
              href="/catalog"
              className="hover:text-[#1a6b50] transition-colors"
            >
              Catalog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/catalog?category=${product.category}`}
              className="hover:text-[#1a6b50] transition-colors"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </nav>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-10">
            {/* LEFT — Images */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-6xl opacity-20">📦</span>
                  </div>
                )}
                {isInStock && (
                  <span className="absolute top-3 left-3 bg-[#1a6b50] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                    Ready Stock
                  </span>
                )}
                {isPreOrder && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
                    Pre-Order
                  </span>
                )}
                {isOutOfStock && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? 'border-[#1a6b50] shadow-md'
                          : 'border-gray-200 hover:border-[#1a6b50]'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Details + Actions */}
            <div className="space-y-5">
              {/* SKU + status */}
              <div className="flex items-center gap-2 flex-wrap">
                {isInStock && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1a6b50]">
                    <span className="w-2 h-2 rounded-full bg-[#1a6b50] inline-block" />
                    Ready Stock
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {skuDisplay}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating placeholder */}
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  (124 Trusted Reviews)
                </span>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-gray-400">/ Unit</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Inclusive of basic sourcing and export handling
                </p>
              </div>

              {/* Payment options */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Flexible Payment Options
                </p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8f4f0] border border-[#b2d8cc] rounded-lg text-xs font-semibold text-[#1a6b50]">
                    Instant Clearance
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                    1-3 Days Transfer
                  </span>
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              {isInStock && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                      Order Quantity
                    </label>
                    <div className="flex items-center gap-0 border border-gray-200 rounded-xl w-fit overflow-hidden bg-white">
                      <button
                        onClick={decrementQuantity}
                        aria-label="Decrease quantity"
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-200"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900 text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        aria-label="Increase quantity"
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-[#1a6b50] hover:bg-[#155a42] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>

                  <Link
                    href="/sourcing/request"
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#1a6b50] text-[#1a6b50] hover:bg-[#e8f4f0] font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Request Custom Quote
                  </Link>
                </div>
              )}

              {/* Pre-order CTA */}
              {isPreOrder && (
                <div className="bg-[#1a6b50] rounded-2xl p-5 space-y-4 text-white">
                  <div>
                    <h3 className="font-bold text-base mb-1">
                      Secure via Pre-order
                    </h3>
                    <p className="text-[#a8d5c4] text-sm leading-relaxed">
                      Reserve now with a deposit. Fulfilled upon restock.
                    </p>
                  </div>
                  <div className="bg-[#155a42] rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#a8d5c4]">
                      Required Deposit ({depositPercent}%)
                    </span>
                    <span className="text-lg font-black text-white">
                      {depositAmount
                        ? formatCurrency(depositAmount)
                        : formatCurrency(product.price * 0.3)}
                    </span>
                  </div>
                  <button className="w-full bg-white text-[#1a6b50] hover:bg-[#e8f4f0] font-bold py-3 rounded-xl transition-colors">
                    Place Pre-order Deposit
                  </button>
                  <button className="w-full border-2 border-[#2a8a65] hover:border-white text-white font-bold py-3 rounded-xl transition-colors">
                    Request Formal Bank Invoice
                  </button>
                </div>
              )}

              {/* Out of stock */}
              {isOutOfStock && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">
                      Currently out of stock. Request a quote for future
                      availability.
                    </p>
                  </div>
                  <Link
                    href="/sourcing/request"
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#1a6b50] text-[#1a6b50] hover:bg-[#e8f4f0] font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Request Custom Quote
                  </Link>
                </div>
              )}

              {/* Trust icons */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  {
                    icon: <Shield className="w-4 h-4 text-[#1a6b50]" />,
                    label: 'Trade Assurance',
                  },
                  {
                    icon: <Truck className="w-4 h-4 text-[#1a6b50]" />,
                    label: 'Tracked Freight',
                  },
                  {
                    icon: <Package className="w-4 h-4 text-[#1a6b50]" />,
                    label: 'Secure Escrow',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 bg-white border border-gray-100 rounded-xl py-3 px-2"
                  >
                    {item.icon}
                    <span className="text-[10px] font-semibold text-gray-500 text-center">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Secure checkout */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Lock className="h-3 w-3 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Secure Payment via Pan-Africa Escrow
                </span>
              </div>
            </div>
          </div>

          {/* ── Tabbed Description Section ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-10">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === i
                      ? 'border-[#1a6b50] text-[#1a6b50]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 mb-3">
                      Industrial Performance, Reimagined
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                      {product.description}
                    </p>
                    {product.specifications?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                          Core Benefits:
                        </p>
                        <ul className="space-y-2">
                          {product.specifications.slice(0, 3).map((spec) => (
                            <li
                              key={spec.id}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-[#1a6b50] font-bold mt-0.5">
                                •
                              </span>
                              {spec.label}: {spec.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  {product.specifications?.length > 0 ? (
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec, idx) => (
                          <tr
                            key={spec.id}
                            className={
                              idx % 2 === 0 ? 'bg-[#f0faf6]' : 'bg-white'
                            }
                          >
                            <td className="px-5 py-3 font-semibold text-gray-700 w-1/3 rounded-l-lg">
                              {spec.label}
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No specifications available for this product.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    {
                      icon: <Truck className="w-5 h-5 text-[#1a6b50]" />,
                      title: 'Air Freight',
                      desc: '7–14 business days to Kenya',
                    },
                    {
                      icon: <Package className="w-5 h-5 text-[#1a6b50]" />,
                      title: 'Sea Freight',
                      desc: '35–40 days, cost-effective for bulk',
                    },
                    {
                      icon: <Shield className="w-5 h-5 text-[#1a6b50]" />,
                      title: 'Insured Cargo',
                      desc: 'Full coverage during transit',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="bg-[#f0faf6] rounded-xl p-5"
                    >
                      <div className="w-10 h-10 bg-[#e8f4f0] rounded-xl flex items-center justify-center mb-3">
                        {item.icon}
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#f0faf6] rounded-xl">
                    <div className="w-10 h-10 bg-[#1a6b50] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Verified Chinese Manufacturer
                      </p>
                      <p className="text-xs text-gray-500">
                        Factory audited and quality-certified by Smart Supply
                        Sourcing China
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    All vendors on our platform are vetted through a rigorous
                    supplier qualification process including factory audits,
                    quality inspections, and compliance verification.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">
                  Recommended for Your Business
                </h2>
                <Link
                  href="/catalog"
                  className="text-sm font-semibold text-[#1a6b50] hover:text-[#155a42] transition-colors"
                >
                  View Catalog →
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                      {p.availability === 'in-stock' && (
                        <span className="absolute top-2 left-2 z-10 bg-[#1a6b50] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          M-Pesa
                        </span>
                      )}
                      {p.imageUrls?.[0] ? (
                        <Image
                          src={p.imageUrls[0]}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-20">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a6b50] mb-1">
                        {p.category
                          ?.replace(/-/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase()) ??
                          'Industrial Sourcing'}
                      </p>
                      <p className="text-xs font-bold text-gray-900 line-clamp-2 mb-2 leading-snug">
                        {p.name}
                      </p>
                      <p className="text-sm font-black text-[#1a6b50]">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
