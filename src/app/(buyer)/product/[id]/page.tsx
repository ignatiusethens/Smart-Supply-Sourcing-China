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
  RotateCcw,
  Minus,
  Plus,
  Lock,
  AlertTriangle,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [id, setId] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const addItem = useCartStore((state) => state.addItem);

  React.useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading, error } = useSWR(
    id ? `/api/products/${id}` : null,
    fetcher
  );

  const product: Product = data?.data;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  const handleRequestQuote = () => {
    console.log('Request quote for product:', product?.id);
  };

  const handlePreOrder = () => {
    console.log('Place pre-order for product:', product?.id);
  };

  const handleBankInvoice = () => {
    console.log('Request bank invoice for product:', product?.id);
  };

  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQuantity = () => setQuantity((q) => Math.min(100, q + 1));

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-6 bg-primary-200 rounded w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-96 bg-primary-200 rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-primary-200 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-primary-200 rounded w-3/4" />
              <div className="h-12 bg-primary-200 rounded w-1/2" />
              <div className="h-40 bg-primary-200 rounded" />
              <div className="h-12 bg-primary-200 rounded" />
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  // ── Error / not found state ────────────────────────────────────────────────
  if (error || !product) {
    return (
      <BuyerLayout>
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-error-50 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>
          <p className="text-primary-700 font-semibold text-lg mb-2">
            Product not found
          </p>
          <p className="text-primary-500 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-info-600 hover:bg-info-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Catalog
          </Link>
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

  return (
    <BuyerLayout>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase text-primary-400">
          <li>
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href="/catalog"
              className="hover:text-primary-600 transition-colors"
            >
              Catalog
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href={`/catalog?category=${product.category}`}
              className="hover:text-primary-600 transition-colors"
            >
              {categoryLabel}
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="text-primary-700 truncate max-w-xs">
            {product.name.toUpperCase()}
          </li>
        </ol>
      </nav>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* ════════════════════════════════════════════════════════════════
            LEFT COLUMN — Images + Description
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Main image + vertical thumbnail strip */}
          <div className="flex gap-3">
            {/* Vertical thumbnail strip */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16 shrink-0">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-info-600 shadow-md'
                        : 'border-primary-200 hover:border-primary-400'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Large main image */}
            <div className="relative flex-1 aspect-[4/3] bg-primary-100 rounded-xl overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-primary-400 text-sm">
                    No image available
                  </span>
                </div>
              )}

              {/* "Premium Industrial" label overlay (in-stock) */}
              {isInStock && (
                <div className="absolute top-3 left-3">
                  <span className="bg-primary-800 bg-opacity-80 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                    Premium Industrial
                  </span>
                </div>
              )}

              {/* Out of Stock badge */}
              {isOutOfStock && (
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="bg-error-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    Out of Stock
                  </span>
                  <span className="bg-warning-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    Next Restock: 14 Days
                  </span>
                </div>
              )}

              {/* Pre-order badge */}
              {isPreOrder && (
                <div className="absolute top-3 left-3">
                  <span className="bg-warning-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    Pre-Order
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Description */}
          <div className="bg-white border border-primary-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-3">
              {isPreOrder ? 'Product Overview' : 'Technical Description'}
            </h2>
            <p className="text-primary-700 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>

          {/* Warranty / Delivery / Returns info cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Warranty */}
            <div className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-success-50 rounded-full mb-2">
                <Shield className="h-5 w-5 text-success-600" />
              </div>
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-1">
                Warranty
              </p>
              <p className="text-xs text-primary-500">
                {product.warrantyDuration ?? '12 Months'}
              </p>
            </div>

            {/* Delivery */}
            <div className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-info-50 rounded-full mb-2">
                <Truck className="h-5 w-5 text-info-600" />
              </div>
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-1">
                Delivery
              </p>
              <p className="text-xs text-primary-500">3–7 Business Days</p>
            </div>

            {/* Returns */}
            <div className="bg-white border border-primary-200 rounded-xl p-4 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-accent-50 rounded-full mb-2">
                <RotateCcw className="h-5 w-5 text-accent-600" />
              </div>
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-1">
                Returns
              </p>
              <p className="text-xs text-primary-500">30-Day Policy</p>
            </div>
          </div>

          {/* ISO / Warranty badges (pre-order page) */}
          {isPreOrder && (
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                <Shield className="h-4 w-4 text-primary-600" />
                <span className="text-xs font-semibold text-primary-700">
                  ISO 9001 Certified
                </span>
              </div>
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
                <Shield className="h-4 w-4 text-success-600" />
                <span className="text-xs font-semibold text-primary-700">
                  Warranty Included
                </span>
              </div>
            </div>
          )}

          {/* Technical Specifications table (pre-order layout shows it on left) */}
          {isPreOrder && product.specifications?.length > 0 && (
            <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-primary-200 bg-primary-50">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary-700">
                  Technical Specifications
                </h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr
                      key={spec.id}
                      className={idx % 2 === 0 ? 'bg-primary-50' : 'bg-white'}
                    >
                      <td className="px-6 py-3 font-semibold text-primary-700 w-1/2">
                        {spec.label}
                      </td>
                      <td className="px-6 py-3 text-primary-600">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT COLUMN — Details + Actions
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-5">
          {/* SKU + Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-info-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
              SKU: {product.id?.slice(0, 8).toUpperCase() ?? 'N/A'}
            </span>
            {isInStock && (
              <span className="bg-success-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                Paid
              </span>
            )}
            {isPreOrder && (
              <span className="bg-warning-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                Pre-Order
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-error-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product name */}
          <h1 className="text-2xl font-extrabold text-primary-900 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary-900">
                {formatCurrency(product.price)}
              </span>
              {isInStock && (
                <span className="text-lg text-primary-400 line-through">
                  {formatCurrency(Math.round(product.price * 1.15))}
                </span>
              )}
            </div>
            {isInStock && (
              <p className="text-xs text-primary-500">
                VAT Included. Shipping calculated at checkout.
              </p>
            )}
            {isPreOrder && (
              <p className="text-xs text-primary-500">
                Price per unit · Subject to availability
              </p>
            )}
          </div>

          {/* KEY SPECIFICATIONS table (in-stock layout shows it on right) */}
          {!isPreOrder && product.specifications?.length > 0 && (
            <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-primary-200 bg-primary-50">
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary-700">
                  Key Specifications
                </h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr
                      key={spec.id}
                      className={idx % 2 === 0 ? 'bg-primary-50' : 'bg-white'}
                    >
                      <td className="px-4 py-2.5 font-semibold text-primary-700 w-1/2 text-xs">
                        {spec.label}
                      </td>
                      <td className="px-4 py-2.5 text-primary-600 text-xs">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── IN-STOCK: Quantity + CTA buttons ──────────────────────── */}
          {isInStock && (
            <div className="space-y-3">
              {/* Quantity selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-primary-600">
                  Quantity
                </label>
                <div className="flex items-center gap-0 border border-primary-300 rounded-lg w-fit overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors border-r border-primary-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-primary-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-colors border-l border-primary-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-info-600 hover:bg-info-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>

              {/* Request Custom Quote */}
              <button
                onClick={handleRequestQuote}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary-300 hover:border-primary-500 text-primary-700 hover:text-primary-900 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <FileText className="h-5 w-5" />
                Request Custom Quote
              </button>
            </div>
          )}

          {/* ── OUT-OF-STOCK: Quote only ───────────────────────────────── */}
          {isOutOfStock && (
            <div className="space-y-3">
              <div className="p-4 bg-error-50 border border-error-200 rounded-xl">
                <p className="text-sm text-error-700 font-medium">
                  This product is currently out of stock. You can request a
                  quote for future availability.
                </p>
              </div>
              <button
                onClick={handleRequestQuote}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary-300 hover:border-primary-500 text-primary-700 hover:text-primary-900 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                <FileText className="h-5 w-5" />
                Request Custom Quote
              </button>
            </div>
          )}

          {/* ── PRE-ORDER: Secure via Pre-order box ───────────────────── */}
          {isPreOrder && (
            <div className="space-y-3">
              {/* Blue pre-order box */}
              <div className="bg-info-600 text-white rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-base mb-1">
                    Secure via Pre-order
                  </h3>
                  <p className="text-info-100 text-sm leading-relaxed">
                    Reserve this product now with a deposit. Your order is
                    secured and fulfilled upon restock.
                  </p>
                </div>

                <div className="bg-info-700 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-info-100">
                    Required Deposit ({depositPercent}%)
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    {depositAmount
                      ? formatCurrency(depositAmount)
                      : formatCurrency(product.price * 0.3)}
                  </span>
                </div>

                <button
                  onClick={handlePreOrder}
                  className="w-full bg-white text-info-700 hover:bg-info-50 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Place Pre-order Deposit
                </button>

                <button
                  onClick={handleBankInvoice}
                  className="w-full border-2 border-info-300 hover:border-white text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Request Formal Bank Invoice
                </button>
              </div>
            </div>
          )}

          {/* ── ACCEPTED PAYMENT METHODS ──────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary-600">
              {isPreOrder
                ? 'Accepted Payment Modes'
                : 'Accepted Payment Methods'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* M-Pesa */}
              <div className="bg-white border border-primary-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                    <span className="text-success-700 font-extrabold text-xs">
                      M
                    </span>
                  </div>
                  <span className="bg-success-100 text-success-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Instant
                  </span>
                </div>
                <p className="text-xs font-bold text-primary-800">
                  M-Pesa Express
                </p>
                <p className="text-xs text-primary-500 mt-0.5">Mobile Money</p>
              </div>

              {/* Bank Transfer */}
              <div className="bg-white border border-primary-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-info-50 rounded-lg flex items-center justify-center">
                    <span className="text-info-700 font-extrabold text-xs">
                      B
                    </span>
                  </div>
                  <span className="bg-info-100 text-info-700 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    1–3 Days
                  </span>
                </div>
                <p className="text-xs font-bold text-primary-800">
                  Bank Transfer
                </p>
                <p className="text-xs text-primary-500 mt-0.5">Business Days</p>
              </div>
            </div>
          </div>

          {/* ── PRE-ORDER ESCROW DETAILS ───────────────────────────────── */}
          {isPreOrder && (
            <div className="space-y-3">
              {/* Supply notice warning */}
              <div className="flex items-start gap-3 bg-warning-50 border border-warning-200 rounded-xl p-4">
                <AlertTriangle className="h-5 w-5 text-warning-600 shrink-0 mt-0.5" />
                <p className="text-xs text-warning-700 leading-relaxed">
                  <span className="font-bold">Supply Notice:</span> This item is
                  subject to import lead times. Deposit secures your allocation
                  in the next shipment.
                </p>
              </div>

              {/* Escrow details */}
              <div className="bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-primary-200 bg-primary-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary-700">
                    Pre-Order Escrow Details
                  </h3>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {[
                      { label: 'Bank Name', value: 'Equity Bank Kenya' },
                      {
                        label: 'Account Name',
                        value: 'Smart Supply Sourcing Ltd',
                      },
                      { label: 'Account Number', value: '0123456789' },
                      {
                        label: 'Reference',
                        value: `PRE-${product.id?.slice(0, 6).toUpperCase() ?? 'ORDER'}`,
                      },
                    ].map((row, idx) => (
                      <tr
                        key={row.label}
                        className={idx % 2 === 0 ? 'bg-primary-50' : 'bg-white'}
                      >
                        <td className="px-4 py-2.5 font-semibold text-primary-700 w-1/2">
                          {row.label}
                        </td>
                        <td className="px-4 py-2.5 text-primary-600 font-mono">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Encrypted checkout footer ──────────────────────────────── */}
          <div className="flex items-center justify-center gap-2 py-3 border-t border-primary-200">
            <Lock className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-xs text-primary-400 font-semibold tracking-wide uppercase">
              Encrypted Checkout &amp; Secure Fulfillment
            </span>
          </div>
        </div>
      </div>

      {/* ── Similar Products (pre-order / out-of-stock) ─────────────────── */}
      {(isPreOrder || isOutOfStock) && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-900">
              Similar Products Available Now
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-semibold text-info-600 hover:text-info-700 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
            <p className="text-primary-500 text-sm">
              Browse our catalog for in-stock alternatives in the{' '}
              <Link
                href={`/catalog?category=${product.category}`}
                className="text-info-600 hover:underline font-semibold"
              >
                {categoryLabel}
              </Link>{' '}
              category.
            </p>
          </div>
        </div>
      )}
    </BuyerLayout>
  );
}
