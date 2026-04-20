import Link from 'next/link';
import Image from 'next/image';
import { Product, Quote } from '@/types';
import { getDaysUntilExpiration } from '@/lib/database/queries/landing';

interface LandingPageProps {
  featuredProducts: Product[];
  recentQuotes: Quote[];
}

export function LandingPage({ featuredProducts, recentQuotes }: LandingPageProps) {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Smart Supply Sourcing Platform
            </h1>
            <p className="mb-8 text-lg text-blue-100">
              Your trusted partner for industrial equipment sourcing in Kenya
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/catalog"
                className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Browse Catalog
              </Link>
              <Link
                href="/sourcing/request"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Request Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">
            Featured Products
          </h2>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
                      {product.name}
                    </h3>

                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        KES {product.price.toLocaleString()}
                      </span>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          product.availability === 'in-stock'
                            ? 'bg-green-100 text-green-800'
                            : product.availability === 'pre-order'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.availability === 'in-stock'
                          ? 'In Stock'
                          : product.availability === 'pre-order'
                          ? 'Pre-Order'
                          : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Quotes Section */}
      {recentQuotes.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-3xl font-bold text-gray-900">
              Recent Quotes
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentQuotes.map((quote) => {
                const daysRemaining = getDaysUntilExpiration(quote.validUntil);
                return (
                  <Link
                    key={quote.id}
                    href={`/sourcing/quote/${quote.id}`}
                    className="group rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Quote ID</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {quote.id.slice(0, 8)}...
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          daysRemaining > 3
                            ? 'bg-green-100 text-green-800'
                            : daysRemaining > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {daysRemaining} days left
                      </span>
                    </div>

                    <div className="mb-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        KES {quote.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Line Items</p>
                      <p className="text-gray-900">
                        {quote.lineItems.length} item{quote.lineItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                      Review Quote
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Settlement Options Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">
            Flexible Settlement Options
          </h2>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* M-Pesa Option */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="mb-4 text-4xl">📱</div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">M-Pesa</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>Instant payment processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>Available for orders up to KES 300,000</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>Immediate order confirmation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>No additional documentation required</span>
                </li>
              </ul>
            </div>

            {/* Bank Transfer Option */}
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="mb-4 text-4xl">🏦</div>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Bank Transfer</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>Suitable for high-value orders</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>No transaction limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>1-3 business day processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-green-600">✓</span>
                  <span>Secure payment verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-blue-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Browse our catalog or submit a custom sourcing request today
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/catalog"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              href="/sourcing/request"
              className="inline-block rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
