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
        className="relative overflow-hidden bg-primary-900"
        aria-label="Hero"
      >
        {/* Dark industrial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-800/80" />

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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-info-500/40 bg-info-500/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-info-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-info-500">
              Supply Chain 2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Sourcing Industrial Goods,{' '}
            <span className="text-info-500">Simplified.</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-primary-300">
            Fast-track your procurement with instant M-Pesa payments or secure
            professional Bank Transfers. The most reliable gateway for Kenyan
            B2B supply.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sourcing/request"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-info-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-info-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
            >
              Start Sourcing
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-900"
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
        className="border-b border-primary-200 bg-white px-4 py-10 sm:px-6 lg:px-8"
        aria-label="Platform features"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="flex items-start gap-4 rounded-lg border border-primary-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <p className="font-semibold text-primary-800">
                    {feature.title}
                  </p>
                  <p className="mt-0.5 text-sm text-primary-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          RECENT UNPAID QUOTES SECTION
          ============================================================ */}
      {recentQuotes.length > 0 && (
        <section
          className="bg-primary-50 px-4 py-16 sm:px-6 lg:px-8"
          aria-label="Recent unpaid quotes"
        >
          <div className="mx-auto max-w-7xl">
            {/* Section header */}
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary-900">
                  Recent Unpaid Quotes
                </h2>
                <p className="mt-1 text-sm text-primary-500">
                  Secure your stock by completing payment via M-Pesa or Bank
                  Transfer.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm font-semibold text-info-600 hover:text-info-700"
              >
                View My Dashboard
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Quote cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentQuotes.map((quote) => {
                const daysRemaining = getDaysUntilExpiration(quote.validUntil);
                const quoteRef = `QT-${quote.id.slice(0, 5).toUpperCase()}`;
                return (
                  <div
                    key={quote.id}
                    className="overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4">
                      <span className="font-mono text-sm font-semibold text-primary-700">
                        {quoteRef}
                      </span>
                      <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-warning-700">
                        Unpaid
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4">
                      <p className="mb-1 text-sm text-primary-500">
                        {quote.lineItems.length} item
                        {quote.lineItems.length !== 1 ? 's' : ''} &middot;
                        Issued{' '}
                        {new Date(quote.createdAt).toLocaleDateString('en-KE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>

                      <p className="mb-4 text-2xl font-extrabold text-primary-900">
                        KES {quote.totalAmount.toLocaleString()}
                      </p>

                      {/* Payment method icons */}
                      <div className="mb-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-success-50 px-2 py-1 text-xs font-semibold text-success-700">
                          📱 M-PESA
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-info-50 px-2 py-1 text-xs font-semibold text-info-700">
                          🏦 BANK
                        </span>
                        {daysRemaining <= 3 && daysRemaining > 0 && (
                          <span className="ml-auto text-xs font-medium text-warning-600">
                            {daysRemaining}d left
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/sourcing/quote/${quote.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-info-600 hover:text-info-700"
                      >
                        Complete Payment
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
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
              <h2 className="text-2xl font-bold text-primary-900">
                Featured Inventory
              </h2>
              <p className="mt-1 text-sm text-primary-500">
                Ready to ship products with instant digital payment options.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-info-600 hover:text-info-700"
            >
              Browse Full Catalog
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Product image with payment badges */}
                  <div className="relative h-48 w-full bg-primary-100">
                    {/* Payment badges */}
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-success-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
                        M-PESA INSTANT
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-info-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
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
                          className="text-4xl text-primary-300"
                          aria-hidden="true"
                        >
                          📦
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-snug text-primary-800 group-hover:text-info-600">
                        {product.name}
                      </h3>
                      {/* Availability badge */}
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          product.availability === 'in-stock'
                            ? 'bg-success-50 text-success-700'
                            : product.availability === 'pre-order'
                              ? 'bg-warning-50 text-warning-700'
                              : 'bg-error-50 text-error-700'
                        }`}
                      >
                        {product.availability === 'in-stock'
                          ? 'Paid'
                          : product.availability === 'pre-order'
                            ? 'Pre-Order'
                            : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-primary-400">Price from</p>
                        <p className="text-lg font-bold text-primary-900">
                          KES {product.price.toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/product/${product.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-600 text-lg font-bold text-white shadow transition-colors hover:bg-info-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        +
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-10 text-center">
              <p className="text-primary-500">
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
        className="border-t border-primary-200 bg-primary-50 px-4 py-16 sm:px-6 lg:px-8"
        aria-label="Flexible settlement options"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-2xl font-bold text-primary-900">
            Flexible Settlement
          </h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Payment options */}
            <div>
              <p className="mb-8 text-primary-600">
                Choose the payment method that works best for your business. We
                support instant mobile money and traditional bank transfers for
                all order sizes.
              </p>

              <div className="space-y-4">
                {/* M-Pesa option */}
                <div className="flex items-start gap-4 rounded-xl border border-primary-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-success-50 text-2xl">
                    📱
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">
                      M-Pesa Instant
                    </p>
                    <p className="mt-1 text-sm text-primary-500">
                      Instant payment processing. Available for orders up to KES
                      300,000. Immediate order confirmation with no additional
                      documentation.
                    </p>
                  </div>
                </div>

                {/* Bank Transfer option */}
                <div className="flex items-start gap-4 rounded-xl border border-primary-200 bg-white p-5 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-info-50 text-2xl">
                    🏦
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">
                      Bank Transfer 1-3 Days
                    </p>
                    <p className="mt-1 text-sm text-primary-500">
                      Suitable for high-value orders with no transaction limits.
                      Secure payment verification with 1-3 business day
                      processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Secured Transactions dark card */}
            <div className="rounded-xl bg-primary-900 p-8 text-white shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-700 text-2xl">
                🛡️
              </div>
              <h3 className="mb-3 text-xl font-bold">Secured Transactions</h3>
              <p className="mb-6 text-sm leading-relaxed text-primary-300">
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
                    className="flex items-center gap-3 text-sm text-primary-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-600 text-xs text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-primary-400 hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Learn About Security
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
