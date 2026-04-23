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
    <div className="font-sans text-slate-900 bg-white antialiased">
      {/* ── HERO ── */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(5,46,22,1) 40%, rgba(5,46,22,0.4) 100%)',
          }}
        />
        <div className="container mx-auto px-6 lg:px-20 relative z-10 py-20">
          <div className="max-w-2xl">
            <p className="text-white/80 font-bold uppercase tracking-wider text-sm mb-4">
              SMART SUPPLY SOURCING CHINA
            </p>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white">
              <span className="text-green-400">Source</span> Smarter.
              <br />
              <span className="text-green-400">Pay</span>{' '}
              <span className="text-orange-400">Faster.</span>
              <br />
              Deliver Better.
            </h1>
            <p className="text-white/80 text-lg mb-10 max-w-lg">
              Kenya&apos;s most trusted B2B procurement gateway connecting local
              businesses with verified Chinese suppliers. Instant payments and
              end-to-end logistics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sourcing/request"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-md transition-colors"
              >
                Start Sourcing →
              </Link>
              <Link
                href="/catalog"
                className="border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white font-bold py-3 px-8 rounded-md transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS BAR ── */}
      <section className="relative -mt-12 z-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <svg
                    className="h-6 w-6"
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
                ),
                title: 'B2B Sourcing',
                desc: 'Custom RFQs & Quotes',
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: 'Pro-forma Invoices',
                desc: 'Bank-ready documents',
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    />
                  </svg>
                ),
                title: 'Global Logistics',
                desc: 'Air & Sea Freight',
              },
              {
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: 'Verified Vendors',
                desc: 'Quality guaranteed',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="bg-orange-100 p-3 rounded-lg text-orange-500 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-2">
              Simple Process
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              How SmartSupplySourcingChina Works
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From initial request to final delivery — we handle the complexity
              so you can focus on growing your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                icon: (
                  <svg
                    className="h-8 w-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ),
                title: 'Submit Request',
                desc: 'Describe what you need — quantity, specs, certifications. Takes less than 3 minutes on our portal.',
              },
              {
                num: '02',
                icon: (
                  <svg
                    className="h-8 w-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ),
                title: 'We Source It',
                desc: 'Our team finds verified Chinese suppliers and negotiates the absolute best factory direct price.',
              },
              {
                num: '03',
                icon: (
                  <svg
                    className="h-8 w-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                ),
                title: 'Pay Securely',
                desc: 'Pay via M-Pesa (instant) or Bank Transfer. Pro-forma Invoice provided for your records immediately.',
              },
              {
                num: '04',
                icon: (
                  <svg
                    className="h-8 w-8 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                ),
                title: 'We Deliver',
                desc: 'Air or sea freight straight to your door in Kenya. Track every step of the journey via our dashboard.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100"
              >
                <div className="flex items-center space-x-3 mb-6">
                  {step.icon}
                  <span className="text-4xl font-black text-orange-500 opacity-40">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT QUOTES ── */}
      {recentQuotes.length > 0 && (
        <section className="py-16 bg-white" aria-label="Recent quotes">
          <div className="container mx-auto px-6">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-1">
                  Action Required
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Recent Live Quotes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Complete payment to secure your stock.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-orange-500 hover:text-orange-600"
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
                    className="block rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-orange-400 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                          Quote Ref
                        </p>
                        <p className="font-mono text-sm font-bold text-slate-900">
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
                    <p className="text-3xl font-black text-orange-500 mb-1">
                      KES {quote.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 mb-4">
                      Issued{' '}
                      {new Date(quote.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-500">
                      Complete Payment →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED INVENTORY ── */}
      <section className="py-24 bg-white" aria-label="Featured inventory">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-2">
                Ready to Ship
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Featured Inventory
              </h2>
              <p className="text-slate-500 mt-2">
                In-stock products available for instant M-Pesa payment.
              </p>
            </div>
            <Link
              href="/catalog"
              className="text-orange-500 font-bold hover:underline flex items-center gap-1"
            >
              Browse Full Catalogue <span>→</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {featuredProducts.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group cursor-pointer"
                >
                  <div className="bg-slate-100 aspect-square rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    {product.imageUrls?.[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <span className="text-5xl opacity-20">📦</span>
                    )}
                  </div>
                  <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-md">
                    <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-tighter line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">KES</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-lg font-extrabold text-slate-900">
                        KES {product.price.toLocaleString()}
                      </p>
                      <button
                        className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
                        aria-label={`View ${product.name}`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-slate-500 font-medium">
                Products coming soon. Check back shortly.
              </p>
              <Link
                href="/sourcing/request"
                className="mt-4 inline-block text-sm font-bold text-orange-500 hover:text-orange-600"
              >
                Request a custom sourcing quote →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PAYMENTS SECTION ── */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <p className="text-orange-500 font-bold uppercase text-xs tracking-widest mb-2">
                Flexible Payments
              </p>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
                Pay Your Way
              </h2>
              <p className="text-slate-500 mb-10 text-lg">
                Whether you&apos;re ordering KES 5,500 or KES 5,000,000 — we
                have a payment method that fits.
              </p>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-6">
                  <div className="bg-orange-500 text-white font-bold h-10 w-10 flex items-center justify-center rounded-lg shrink-0 text-sm">
                    M
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-bold text-slate-800">
                        M-Pesa Instant
                      </h4>
                      <span className="bg-orange-100 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Instant
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Available for orders up to KES 500,000. Confirmed in
                      seconds with zero delay.
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-6 opacity-80">
                  <div className="bg-orange-100 text-orange-500 h-10 w-10 flex items-center justify-center rounded-lg shrink-0">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-bold text-slate-800">
                        Bank Transfer
                      </h4>
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        1-3 Days
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      No transaction limits. Ideal for large sea-freight orders.
                      Detailed pro-forma invoices provided for all wire
                      transfers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — orange security card */}
            <div className="bg-orange-500 p-12 rounded-3xl text-white text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-8">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold mb-4">
                  Secured Transactions
                </h3>
                <p className="text-white/80 font-medium mb-4">
                  Enterprise-grade protocols.
                </p>
                <p className="text-white/90 text-lg mb-10 leading-relaxed">
                  Every transaction on Smart Supply Sourcing China is protected
                  by enterprise-grade security protocols. Your payments and
                  business data are always safe.
                </p>
                <Link
                  href="/sourcing/request"
                  className="bg-white text-orange-500 font-black py-4 px-12 rounded-lg hover:bg-slate-100 transition-colors w-full text-center"
                >
                  Start Your First Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="bg-[#052e16] text-white py-20"
        aria-label="Site footer"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-orange-500 h-8 w-8 rounded-full shrink-0" />
                <span className="font-bold text-lg leading-tight">
                  Smart Supply Sourcing China
                </span>
              </div>
              <p className="text-white/60 text-sm mb-8">
                Kenya&apos;s trusted B2B gateway for sourcing quality products
                from China. Fast, secure, and logistics-ready.
              </p>
              <div className="space-y-3 text-sm text-white/80">
                {[
                  { icon: '📍', text: 'Nairobi, Kenya' },
                  { icon: '✉️', text: 'hello@smartsupply.com' },
                  { icon: '📞', text: '+254 700 000 000' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h5 className="font-bold uppercase text-xs tracking-widest text-white/50 mb-6">
                Services
              </h5>
              <ul className="space-y-4 text-sm text-white/80">
                {[
                  { label: 'Product Catalog', href: '/catalog' },
                  { label: 'Custom Sourcing', href: '/sourcing/request' },
                  { label: 'Order Management', href: '/dashboard' },
                  { label: 'Payment Solutions', href: '/catalog' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-orange-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-bold uppercase text-xs tracking-widest text-white/50 mb-6">
                Support
              </h5>
              <ul className="space-y-4 text-sm text-white/80">
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

            {/* Legal */}
            <div>
              <h5 className="font-bold uppercase text-xs tracking-widest text-white/50 mb-6">
                Legal
              </h5>
              <ul className="space-y-4 text-sm text-white/80">
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

            {/* Social */}
            <div>
              <h5 className="font-bold uppercase text-xs tracking-widest text-white/50 mb-6">
                Follow Us
              </h5>
              <div className="flex space-x-3">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="bg-white/10 p-2 rounded-full hover:bg-orange-500 transition-colors"
                  >
                    <span className="sr-only">{s}</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-xs gap-4">
            <p>
              © {new Date().getFullYear()} Smart Supply Sourcing China. All
              rights reserved.
            </p>
            <p>Connecting Kenyan businesses with global suppliers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
