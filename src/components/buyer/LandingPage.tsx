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
      {/* ================================================================
          HERO — Light teal/mint background, two-column layout
          ================================================================ */}
      <section
        className="bg-[#e8f4f0] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-label="Hero"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left: text */}
            <div>
              {/* Brand label */}
              <h1 className="mb-3 text-2xl font-bold text-[#2a7a5e] tracking-wide">
                SmartSupplySourcingChina.com
              </h1>

              {/* Headline */}
              <h1 className="mb-5 text-4xl font-black leading-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]">
                <span className="text-[#1a6b50]">Source</span> Smarter.
                <br />
                <span className="text-[#1a6b50]">Pay</span> Faster.
                <br />
                Deliver Better.
              </h1>

              {/* Subheadline */}
              <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-600">
                Kenya&apos;s most trusted B2B procurement gateway connecting
                local businesses with verified Chinese suppliers. Instant
                payments and end-to-end logistics.
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sourcing/request"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a6b50] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#155a42] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50]"
                >
                  Start Sourcing →
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#1a6b50] bg-white px-7 py-3.5 text-sm font-bold text-[#1a6b50] transition-all hover:bg-[#e8f4f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50]"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-10 flex flex-wrap gap-8">
                {[
                  { icon: '📦', value: '500+', label: 'PRODUCTS SOURCED' },
                  { icon: '💳', value: 'KES 300K', label: 'M-PESA LIMIT' },
                  { icon: '⚡', value: '24–48h', label: 'QUOTE TURNAROUND' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-xl">{stat.icon}</span>
                    <div>
                      <p className="text-lg font-black text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: warehouse image */}
            <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-lg lg:h-[420px]">
              <Image
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80"
                alt="Warehouse and supply chain operations"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TRUST BAR
          ================================================================ */}
      <section className="border-y border-gray-100 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: '📦',
                title: 'B2B Sourcing',
                desc: 'Custom RFQs & Quotes',
              },
              {
                icon: '📄',
                title: 'Pro-forma Invoices',
                desc: 'Bank-ready documents',
              },
              {
                icon: '🚢',
                title: 'Global Logistics',
                desc: 'Air & Sea freight',
              },
              {
                icon: '✅',
                title: 'Verified Vendors',
                desc: 'Quality guaranteed',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS — Light background
          ================================================================ */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1a6b50]">
              Simple Process
            </span>
            <h2 className="mt-2 text-3xl font-black text-gray-900">
              How SmartSupplySourcingChina Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              From initial request to final delivery — we handle the complexity
              so you can focus on growing your business.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Submit Request',
                desc: 'Describe what you need — quantity, specs, certifications. Takes less than 2 minutes via our portal.',
              },
              {
                step: '02',
                icon: '🔍',
                title: 'We Source It',
                desc: 'Our team finds verified Chinese suppliers and negotiates the absolute best factory-direct price.',
              },
              {
                step: '03',
                icon: '💳',
                title: 'Pay Securely',
                desc: 'Pay via M-Pesa (instant) or Bank Transfer. Pro-forma invoice provided for your records immediately.',
              },
              {
                step: '04',
                icon: '🚀',
                title: 'We Deliver',
                desc: 'Air or sea freight straight to your door in Kenya. Track every step of the journey via our dashboard.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-4xl font-black text-[#1a6b50] opacity-30">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          RECENT QUOTES (only shown when logged in / data exists)
          ================================================================ */}
      {recentQuotes.length > 0 && (
        <section
          className="bg-[#e8f4f0] px-4 py-16 sm:px-6 lg:px-8"
          aria-label="Recent quotes"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#1a6b50]">
                  Action Required
                </span>
                <h2 className="mt-1 text-2xl font-black text-gray-900">
                  Recent Live Quotes
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Complete payment to secure your stock.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-[#1a6b50] hover:text-[#155a42]"
              >
                View all quotes →
              </Link>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {recentQuotes.slice(0, 3).map((quote) => {
                const daysLeft = getDaysUntilExpiration(quote.validUntil);
                const quoteRef = `SSS-${new Date(quote.createdAt).getFullYear()}-${quote.id.slice(0, 6).toUpperCase()}`;
                return (
                  <Link
                    key={quote.id}
                    href={`/sourcing/quote/${quote.id}`}
                    className="block rounded-xl border border-[#b2d8cc] bg-white p-6 transition-all hover:border-[#1a6b50] hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Quote Ref
                        </p>
                        <p className="font-mono text-sm font-bold text-gray-900">
                          {quoteRef}
                        </p>
                      </div>
                      {daysLeft <= 3 ? (
                        <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600">
                          {daysLeft}d left
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-600">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black text-[#1a6b50] mb-1">
                      KES {quote.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Issued{' '}
                      {new Date(quote.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1a6b50]">
                      Complete Payment →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          FEATURED INVENTORY
          ================================================================ */}
      <section
        className="bg-[#f0faf6] px-4 py-20 sm:px-6 lg:px-8"
        aria-label="Featured inventory"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1a6b50]">
                Ready to Ship
              </span>
              <h2 className="mt-1 text-3xl font-black text-gray-900">
                Featured Inventory
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                In-stock products available for instant M-Pesa payment.
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1a6b50] hover:text-[#155a42]"
            >
              Browse Full Catalogue →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.slice(0, 3).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a6b50] line-clamp-2 text-sm mb-3">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-0.5">From</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-[#1a6b50]">
                        KES {product.price.toLocaleString()}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a6b50] text-white font-black text-lg group-hover:bg-[#155a42] transition-colors">
                        +
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center bg-white">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 font-medium">
                Products coming soon. Check back shortly.
              </p>
              <Link
                href="/sourcing/request"
                className="mt-4 inline-block text-sm font-bold text-[#1a6b50] hover:text-[#155a42]"
              >
                Request a custom sourcing quote →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          PAYMENT SECTION
          ================================================================ */}
      <section
        className="bg-white px-4 py-20 sm:px-6 lg:px-8"
        aria-label="Payment options"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            {/* Left */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1a6b50]">
                Flexible Payments
              </span>
              <h2 className="mt-2 text-3xl font-black text-gray-900">
                Pay Your Way
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed text-sm">
                Whether you&apos;re paying KES 5,000 or KES 5,000,000 — we have
                a payment method that works for your cash flow.
              </p>

              <div className="mt-8 space-y-4">
                {/* M-Pesa */}
                <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white font-black text-base">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm">
                        M-Pesa Instant
                      </p>
                      <span className="rounded-full bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-bold text-green-700">
                        Instant
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Available for orders up to KES 300,000. Confirmed in
                      seconds with zero paperwork required.
                    </p>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    🏦
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm">
                        Bank Transfer
                      </p>
                      <span className="rounded-full bg-blue-100 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700">
                        1-3 Days
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      No transaction limits. Ideal for large sea-freight orders.
                      Detailed pro-forma invoices provided for all wire
                      transfers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — orange/amber security card matching PDF */}
            <div className="rounded-2xl bg-[#f97316] p-8 text-white shadow-lg">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl">
                  🛡️
                </div>
                <div>
                  <h3 className="text-lg font-black">Secured Transactions</h3>
                  <p className="text-sm text-orange-100">
                    Enterprise-grade protection
                  </p>
                </div>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-orange-50">
                Every transaction on Smart Supply Sourcing China is protected by
                enterprise-grade security protocols. Your payments and business
                data are always safe.
              </p>
              <ul className="mb-8 space-y-2.5">
                {[
                  'Automated Payment Reconciliation',
                  'Escrow-enabled Multi-Vendor Support',
                  'Full Ledger Export for Auditing',
                  'SSL-encrypted Data Transmission',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-orange-50 font-medium"
                  >
                    <span className="text-white font-black">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sourcing/request"
                className="inline-flex items-center justify-center w-full rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50"
              >
                Start Your First Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA BANNER — Dark navy matching PDF
          ================================================================ */}
      <section className="bg-[#1e3a5f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to source from China?
          </h2>
          <p className="mt-4 text-base text-blue-200">
            Join hundreds of Kenyan businesses already using Smart Supply
            Sourcing China to streamline their supply chain and grow their
            margins.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-black text-[#1e3a5f] shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
            >
              Create Free Account
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer
        className="bg-white border-t border-gray-100 text-gray-700"
        aria-label="Site footer"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Smart Supply Sourcing logo"
                  width={44}
                  height={44}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-black text-gray-900 leading-tight">
                    Smart Supply Sourcing
                  </p>
                  <p className="text-xs text-[#1a6b50] font-semibold leading-tight">
                    China.com
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Kenya&apos;s trusted B2B gateway for sourcing quality goods from
                China. Fast, secure, and reliable.
              </p>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📍 Nairobi, Kenya</p>
                <p>✉️ hello@smartsupply.com</p>
                <p>📞 +254 700 000 000</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Services
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {[
                  { label: 'Product Catalog', href: '/catalog' },
                  { label: 'Custom Sourcing', href: '/sourcing/request' },
                  { label: 'Order Management', href: '/dashboard' },
                  { label: 'Payment Solutions', href: '/catalog' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-[#1a6b50] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Support
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {[
                  { label: 'Help Center', href: '/' },
                  { label: 'Contact Us', href: '/' },
                  { label: 'Shipping Info', href: '/' },
                  { label: 'Returns Policy', href: '/' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-[#1a6b50] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {[
                  { label: 'Privacy Policy', href: '/' },
                  { label: 'Terms of Service', href: '/' },
                  { label: 'Compliance', href: '/' },
                  { label: 'Security', href: '/' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-[#1a6b50] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} SmartSupplySourcingChina.com · All
              rights reserved.
            </p>
            <p className="text-xs text-gray-400">
              Connecting Kenyan businesses with global suppliers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
