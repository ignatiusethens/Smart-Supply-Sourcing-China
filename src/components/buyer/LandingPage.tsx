import Link from 'next/link';
import Image from 'next/image';
import { Product, Quote } from '@/types';
import { getDaysUntilExpiration } from '@/lib/database/queries/landing';

interface LandingPageProps {
  featuredProducts: Product[];
  recentQuotes: Quote[];
}

export function LandingPage({
  featuredProducts,
  recentQuotes,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================
          HERO SECTION — Industrial warehouse dark background
          ============================================================ */}
      <section
        className="relative overflow-hidden bg-gray-900"
        aria-label="Hero"
      >
        {/* Dark industrial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-800/80" />

        {/* Subtle grid pattern for industrial texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500">
              Supply Chain 2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Sourcing Goods, <span className="text-blue-500">Simplified.</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-300">
            Fast-track your procurement with instant M-Pesa payments or secure
            professional Bank Transfers. The most reliable gateway for Kenyan
            B2B supply.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sourcing/request"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Start Sourcing
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              View Stock Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURE CARDS ROW
          ============================================================ */}
      <section
        className="border-b border-gray-200 bg-white px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Platform features"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                icon: '📦',
                title: 'B2B Sourcing',
                description: 'Custom RFQs & Quotes',
              },
              {
                icon: '📄',
                title: 'Pro-forma Invoices',
                description: 'Download Bank Details',
              },
              {
                icon: '🚚',
                title: 'Global Logistics',
                description: 'Track Cargo Status',
              },
              {
                icon: '🛡️',
                title: 'Verified Vendors',
                description: 'Certified Quality Control',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <span className="text-xl shrink-0" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {feature.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          RECENT LIQUID QUOTES SECTION
          ============================================================ */}
      {recentQuotes.length > 0 && (
        <section
          className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
          aria-label="Recent liquid quotes"
        >
          <div className="mx-auto max-w-7xl">
            {/* Section header */}
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Liquid Quotes
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Secure your stock by completing payment via M-Pesa or Bank
                  Transfer.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all quotes
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Quote cards - 3 column grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {recentQuotes.slice(0, 3).map((quote) => {
                const quoteRef = `SSS-${new Date(quote.createdAt).getFullYear()}-${quote.id.slice(0, 6).toUpperCase()}`;
                return (
                  <Link
                    key={quote.id}
                    href={`/sourcing/quote/${quote.id}`}
                    className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Quote
                          </p>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {quoteRef}
                          </p>
                        </div>
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                          Pending
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Issued{' '}
                          {new Date(quote.createdAt).toLocaleDateString(
                            'en-KE',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          KES {quote.totalAmount.toLocaleString()}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                        View Details
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          FEATURED INVENTORY SECTION
          ============================================================ */}
      <section
        className="bg-white px-4 py-16 sm:px-6 lg:px-8"
        aria-label="Featured inventory"
      >
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Inventory
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Ready to ship products with instant digital payment options.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse Catalogue
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* Product image with payment badges */}
                  <div className="relative h-48 w-full bg-gray-100">
                    {/* Payment badges */}
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                        M-PESA INSTANT
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                        BANK 1-3 DAYS
                      </span>
                    </div>

                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span
                          className="text-4xl text-gray-400"
                          aria-hidden="true"
                        >
                          📦
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold leading-snug text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Price from</p>
                        <p className="text-lg font-bold text-gray-900">
                          KES {product.price.toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/product/${product.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label={`View ${product.name} details`}
                      >
                        +
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-10 text-center">
              <p className="text-gray-500">
                No featured products available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          FLEXIBLE SETTLEMENT SECTION
          ============================================================ */}
      <section
        className="border-t border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8"
        aria-label="Flexible settlement options"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-2xl font-bold text-gray-900">
            Flexible Settlement
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Payment options */}
            <div>
              <p className="mb-8 text-gray-600">
                Choose the payment method that works best for your business. We
                support instant mobile money and traditional bank transfers for
                all order sizes.
              </p>

              <div className="space-y-4">
                {/* M-Pesa option */}
                <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-2xl">
                    📱
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      M-Pesa Instant
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Instant payment processing. Available for orders up to KES
                      300,000. Immediate order confirmation with no additional
                      documentation.
                    </p>
                  </div>
                </div>

                {/* Bank Transfer option */}
                <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    🏦
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Bank Transfer 1-3 Days
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Suitable for high-value orders with no transaction limits.
                      Secure payment verification with 1-3 business day
                      processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Secured Transactions dark card */}
            <div className="rounded-lg bg-gray-900 p-8 text-white shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700 text-2xl">
                🛡️
              </div>
              <h3 className="mb-3 text-xl font-bold">Secured Transactions</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-300">
                Every transaction on our platform is protected by
                enterprise-grade security protocols, ensuring your payments and
                data are always safe.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  'Automated Payment Reconciliation',
                  'Escrow-enabled Multi-Vendor Support',
                  'Full Ledger Export for Auditing',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gray-400 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Learn About Security
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER SECTION
          ============================================================ */}
      <footer className="bg-gray-900 text-white" aria-label="Site footer">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">SS</span>
                </div>
                <span className="text-lg font-bold">Smart Supply Sourcing</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Leading B2B industrial equipment sourcing platform connecting
                Kenyan businesses with global suppliers.
              </p>
              <div className="text-sm text-gray-400">
                <p>Nairobi, Kenya</p>
                <p>+254 700 000 000</p>
                <p>info@smartsupply.co.ke</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">
                Services
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/catalog"
                    className="hover:text-white transition-colors"
                  >
                    Product Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sourcing/request"
                    className="hover:text-white transition-colors"
                  >
                    Custom Sourcing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Order Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/payment"
                    className="hover:text-white transition-colors"
                  >
                    Payment Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="hover:text-white transition-colors"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="hover:text-white transition-colors"
                  >
                    Returns Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compliance"
                    className="hover:text-white transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 Smart Supply Sourcing. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
