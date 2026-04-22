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
          HERO — Full-bleed dark with warehouse background
          ================================================================ */}
      <section
        className="relative min-h-[600px] flex items-center overflow-hidden bg-gray-950"
        aria-label="Hero"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
            alt="Warehouse and supply chain operations"
            fill
            className="object-cover opacity-30"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-900/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            {/* Brand pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 backdrop-blur-sm">
              <Image
                src="/logo.png"
                alt="Smart Supply Sourcing logo"
                width={24}
                height={24}
                className="rounded-full"
                unoptimized
              />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                SmartSupplySourcingChina.com
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Source Smarter.
              <br />
              <span className="text-blue-400">Pay Faster.</span>
              <br />
              <span className="text-gray-300">Deliver Better.</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-300">
              Kenya&apos;s most trusted B2B procurement gateway — connecting
              businesses with verified Chinese suppliers. Instant M-Pesa
              payments, pro-forma invoices, and end-to-end logistics.
            </p>

            {/* Stats row */}
            <div className="mb-10 flex flex-wrap gap-6">
              {[
                { value: '500+', label: 'Products Sourced' },
                { value: 'KES 300K', label: 'M-Pesa Limit' },
                { value: '24–48h', label: 'Quote Turnaround' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-blue-400">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sourcing/request"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Start Sourcing →
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ================================================================
          TRUST BAR
          ================================================================ */}
      <section className="border-b border-gray-100 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: '📦',
                title: 'B2B Sourcing',
                desc: 'Custom RFQs & Quotes',
                color: 'bg-blue-50 border-blue-100 text-blue-700',
              },
              {
                icon: '📄',
                title: 'Pro-forma Invoices',
                desc: 'Bank-ready documents',
                color: 'bg-purple-50 border-purple-100 text-purple-700',
              },
              {
                icon: '🚢',
                title: 'Global Logistics',
                desc: 'Air & Sea freight',
                color: 'bg-orange-50 border-orange-100 text-orange-700',
              },
              {
                icon: '✅',
                title: 'Verified Vendors',
                desc: 'Quality guaranteed',
                color: 'bg-green-50 border-green-100 text-green-700',
              },
            ].map((f) => (
              <div
                key={f.title}
                className={`flex items-center gap-3 rounded-xl border p-4 ${f.color}`}
              >
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-xs opacity-70 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
          ================================================================ */}
      <section className="bg-gray-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Simple Process
            </span>
            <h2 className="mt-2 text-3xl font-black text-white">
              How SmartSupplySourcingChina Works
            </h2>
            <p className="mt-3 text-gray-400 max-w-xl mx-auto">
              From request to delivery — we handle everything so you can focus
              on your business.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: '📝',
                title: 'Submit Request',
                desc: 'Describe what you need — quantity, specs, certifications. Takes 2 minutes.',
              },
              {
                step: '02',
                icon: '🔍',
                title: 'We Source It',
                desc: 'Our team finds verified Chinese suppliers and negotiates the best price.',
              },
              {
                step: '03',
                icon: '💳',
                title: 'Pay Securely',
                desc: 'Pay via M-Pesa (instant) or Bank Transfer. Pro-forma invoice provided.',
              },
              {
                step: '04',
                icon: '🚀',
                title: 'We Deliver',
                desc: 'Air or sea freight to your door. Track every step of the journey.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-4xl font-black text-gray-800">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
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
          className="bg-blue-950 px-4 py-16 sm:px-6 lg:px-8"
          aria-label="Recent quotes"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  Action Required
                </span>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Recent Liquid Quotes
                </h2>
                <p className="mt-1 text-sm text-blue-300">
                  Complete payment to secure your stock.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300"
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
                    className="block rounded-xl border border-blue-800 bg-blue-900/50 p-6 transition-all hover:border-blue-500 hover:bg-blue-900 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-blue-400 uppercase tracking-wide font-semibold">
                          Quote Ref
                        </p>
                        <p className="font-mono text-sm font-bold text-white">
                          {quoteRef}
                        </p>
                      </div>
                      {daysLeft <= 3 ? (
                        <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-400">
                          {daysLeft}d left
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-2.5 py-1 text-xs font-bold text-orange-400">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-black text-blue-400 mb-1">
                      KES {quote.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-400 mb-4">
                      Issued{' '}
                      {new Date(quote.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-white">
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
        className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8"
        aria-label="Featured inventory"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
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
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Browse Full Catalogue →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                      <span className="rounded-md bg-green-600 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-white shadow">
                        M-PESA ✓
                      </span>
                      <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-white shadow">
                        BANK 1-3D
                      </span>
                    </div>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 border-t-2 border-blue-600">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 text-sm mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">From</p>
                        <p className="text-lg font-black text-blue-600">
                          KES {product.price.toLocaleString()}
                        </p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-lg group-hover:bg-blue-700 transition-colors">
                        +
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 font-medium">
                Products coming soon. Check back shortly.
              </p>
              <Link
                href="/sourcing/request"
                className="mt-4 inline-block text-sm font-bold text-blue-600 hover:text-blue-700"
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
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            {/* Left */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Flexible Payments
              </span>
              <h2 className="mt-2 text-3xl font-black text-gray-900">
                Pay Your Way
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Whether you&apos;re paying KES 5,000 or KES 5,000,000 — we have
                a payment method that works for your business.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border-2 border-green-200 bg-green-50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-2xl text-white font-black">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">M-Pesa Instant</p>
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                        INSTANT
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Available for orders up to KES 300,000. Confirmed in
                      seconds with no paperwork.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-2xl">
                    🏦
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">Bank Transfer</p>
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                        1-3 DAYS
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      No transaction limits. Ideal for large orders. Pro-forma
                      invoice provided.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — dark security card */}
            <div className="rounded-2xl bg-gray-950 p-8 text-white border border-gray-800">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xl font-black">Secured Transactions</h3>
                  <p className="text-sm text-gray-400">
                    Enterprise-grade protection
                  </p>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-300">
                Every transaction on SmartSupplySourcingChina is protected by
                enterprise-grade security protocols. Your payments and business
                data are always safe.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  '✓  Automated Payment Reconciliation',
                  '✓  Escrow-enabled Multi-Vendor Support',
                  '✓  Full Ledger Export for Auditing',
                  '✓  SSL-encrypted data transmission',
                ].map((item) => (
                  <li key={item} className="text-sm text-gray-300 font-medium">
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/sourcing/request"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
              >
                Start Your First Order →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA BANNER
          ================================================================ */}
      <section className="relative overflow-hidden bg-blue-600 px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Ready to source from China?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join hundreds of Kenyan businesses already using
            SmartSupplySourcingChina.com
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-black text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
            >
              Create Free Account →
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-base font-bold text-white transition-all hover:border-white hover:bg-white/10"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="bg-gray-950 text-white" aria-label="Site footer">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Smart Supply Sourcing logo"
                  width={48}
                  height={48}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <p className="text-sm font-black text-white leading-tight">
                    SmartSupply
                  </p>
                  <p className="text-xs text-blue-400 font-semibold leading-tight">
                    SourcingChina.com
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Kenya&apos;s trusted B2B gateway for sourcing quality goods from
                China. Fast, secure, and reliable.
              </p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>📍 Nairobi, Kenya</p>
                <p>✉️ smartsupplysourcing@gmail.com</p>
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
                      className="hover:text-white transition-colors"
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
                      className="hover:text-white transition-colors"
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
                      className="hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} SmartSupplySourcingChina.com · All
              rights reserved.
            </p>
            <p className="text-xs text-gray-700">
              Connecting Kenyan businesses with global suppliers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
