'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';
import Image from 'next/image';
import { User, ChevronDown, Shield, Info } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePaymentTab, setActivePaymentTab] = useState<'mpesa' | 'bank'>(
    'mpesa'
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  // Auth guard
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Redirect to cart if empty
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Calculate order totals
  const subtotal = 128500; // Mock data from design
  const shipping = 18000;
  const taxes = 8390;
  const total = 154890;

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect
      clearCart();
      router.push('/orders');
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/catalog" className="text-blue-600 hover:text-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Custom CSS */}
      <style jsx>{`
        .payment-tab-active {
          border-bottom: 2px solid #1b4332;
          color: #1b4332;
        }
        .btn-primary {
          background-color: #1b4332;
          color: white;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #143225;
        }
        .card-shadow {
          box-shadow:
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* Main Header */}
      <header className="bg-[#1B4332] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and Site Name */}
          <div className="flex items-center gap-3">
            <Image
              alt="Smart Supply Logo"
              className="w-10 h-10 object-contain"
              src="/logo.png"
              width={40}
              height={40}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-white">
                Smart Supply Sourcing China
              </span>
              <span className="text-xs text-green-600">China</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/80">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/sourcing/request" className="hover:text-white">
              Sourcing
            </Link>
            <Link href="/catalog" className="hover:text-white">
              Catalog
            </Link>
            <Link href="/orders" className="hover:text-white">
              My Orders
            </Link>
            <Link href="/support" className="hover:text-white">
              Support
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center">
            <button className="flex items-center hover:text-gray-600 text-white/80">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <ChevronDown className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mt-4 mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment Methods */}
          <div className="lg:col-span-2 space-y-8">
            {/* M-Pesa STK Payment Option */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-shadow">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                <button
                  className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium ${
                    activePaymentTab === 'mpesa'
                      ? 'payment-tab-active bg-white'
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => setActivePaymentTab('mpesa')}
                >
                  <div className="h-5 w-5 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  M-Pesa
                </button>
                <button
                  className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium border-l border-gray-100 ${
                    activePaymentTab === 'bank'
                      ? 'payment-tab-active bg-white'
                      : 'text-gray-500 bg-gray-50'
                  }`}
                  onClick={() => setActivePaymentTab('bank')}
                >
                  <span className="w-5 h-5 flex items-center justify-center border border-gray-400 rounded-sm">
                    <Shield className="w-3 h-3" />
                  </span>
                  Bank Transfer
                </button>
              </div>

              {/* M-Pesa Content */}
              {activePaymentTab === 'mpesa' && (
                <div className="p-8">
                  <h2 className="text-xl font-bold mb-1">
                    Instant Payment via STK Push
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Instant Payment via champing to STK Push
                  </p>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Country Code
                      </label>
                      <div className="relative">
                        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
                          <div className="w-6 h-4 bg-gradient-to-r from-black via-red-500 to-green-500 mr-2 rounded-sm"></div>
                          <span className="text-sm">+254</span>
                          <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-3/4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        className="w-full border-gray-300 rounded-md py-2 px-3 focus:ring-green-800 focus:border-green-800"
                        placeholder="Enter M-Pesa Phone Number"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full btn-primary py-3 rounded-md font-bold text-lg mb-4 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Pay KES 154,890'}
                  </button>

                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p>
                      A push notification will be sent to your phone to confirm
                      payment.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer Content */}
              {activePaymentTab === 'bank' && (
                <div className="p-8">
                  <h2 className="text-xl font-bold mb-1">Pro-forma Invoice</h2>
                  <p className="text-gray-400 text-xs mb-4">
                    Exports direct date-08, 2023
                  </p>

                  <div className="space-y-1 mb-6 text-sm">
                    <p className="font-bold">Pro-forma Invoice</p>
                    <div className="flex justify-between max-w-xs">
                      <span>Subtotal:</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Shipping (Air Freight):</span>
                      <span>KES {shipping.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between max-w-xs">
                      <span>Taxes & Duties (Est.):</span>
                      <span>KES {taxes.toLocaleString()}</span>
                    </div>
                    <p className="font-bold mt-2">
                      Order amount:{' '}
                      <span className="text-black">
                        Total: KES {total.toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="w-full md:w-1/4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Country Code
                      </label>
                      <div className="relative">
                        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
                          <div className="w-6 h-4 bg-gradient-to-r from-black via-red-500 to-green-500 mr-2 rounded-sm"></div>
                          <span className="text-sm">+254</span>
                          <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-3/4">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        className="w-full border-gray-300 rounded-md py-2 px-3 focus:ring-green-800 focus:border-green-800"
                        placeholder="Enter M-Pesa Phone Number"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full btn-primary py-3 rounded-md font-bold text-lg disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Pay KES 154,890'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary & Security */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-shadow">
              <div className="px-6 py-4 bg-[#f0fdf4]">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-bold">
                    KES {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    Shipping (Air Freight):
                  </span>
                  <span className="font-bold">
                    KES {shipping.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    Taxes & Duties (Est.):
                  </span>
                  <span className="font-bold">
                    KES {taxes.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold">
                    KES {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Badge Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-shadow">
              <div className="p-8 text-center text-white flex flex-col items-center bg-[#f97316]">
                <div className="mb-4">
                  <Shield className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold mb-1">
                  Secured Transactions
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  Enterprise-grade protection
                </p>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <div className="h-6 w-20 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">SSL</span>
                  </div>
                </div>
              </div>
              <div className="py-4 text-center bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  Your data is encrypted and protected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-[#1B4332] py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to source from China?
          </h2>
          <p className="text-green-100 max-w-2xl mx-auto mb-8 opacity-80">
            Join hundreds of Kenyan businesses already using Smart Supply
            Sourcing China to streamline their supply chain and grow their
            margins.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register"
              className="bg-white px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors text-[#1B4332]"
            >
              Create Free Account
            </Link>
            <Link
              href="/catalog"
              className="border border-white text-white px-8 py-3 rounded-md font-bold hover:bg-emerald-800 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 pb-8 bg-[#1B4332] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            {/* About */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  alt="Smart Supply Logo"
                  className="w-10 h-10 object-contain"
                  src="/logo.png"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs leading-tight text-white">
                    Smart Supply Sourcing China
                  </span>
                  <span className="text-[10px] text-green-600">China</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs">
                Kenya&apos;s trusted gateway for sourcing quality goods from
                China. Fast, secure, and reliable.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Nairobi, Kenya</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>hello@smartsupply.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+254 750 000 000</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-green-400">
                Services
              </h4>
              <ul className="space-y-3 text-sm font-medium text-white">
                <li>
                  <Link href="/catalog" className="hover:text-green-400">
                    Product Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sourcing/request"
                    className="hover:text-green-400"
                  >
                    Custom Sourcing
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-green-400">
                    Order Management
                  </Link>
                </li>
                <li>
                  <Link href="/payment" className="hover:text-green-400">
                    Payment Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-green-400">
                Support
              </h4>
              <ul className="space-y-3 text-sm font-medium text-white">
                <li>
                  <Link href="/help" className="hover:text-green-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-green-400">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-green-400">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-green-400">
                    Returns Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider mb-4 text-green-400">
                Legal
              </h4>
              <ul className="space-y-3 text-sm font-medium text-white">
                <li>
                  <Link href="/privacy" className="hover:text-green-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-green-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-green-400">
                    Compliance
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-green-400">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-white/10">
            <p className="text-xs">
              © 2026 Smart Supply Sourcing China · All rights reserved.
            </p>
            <p className="text-xs">
              Connecting businesses with global suppliers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
