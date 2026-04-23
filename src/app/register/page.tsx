'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'buyer' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }
      login(data.user, data.token);
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="flex flex-1">
        {/* ── LEFT: Warehouse photo panel ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80')",
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#012d1d]/70" />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Join thousands of businesses sourcing from China
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              Access verified manufacturers, real-time shipment tracking, and
              secure cross-border payments in one industrial-grade platform.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['🧑‍💼', '👩‍💼', '👨‍💼'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-sm text-white/80 font-medium">
                Trusted by 5,000+ Global Enterprises
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white lg:px-16 xl:px-24">
          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-7 h-7 bg-[#012d1d] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-black">S</span>
              </div>
              <span className="font-bold text-[#012d1d] text-lg">
                Smart Supply Sourcing China
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Create your Business Account
            </h1>
            <p className="text-gray-500 text-sm mb-8">
              Start optimizing your supply chain today.
            </p>

            {/* Google SSO placeholder */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:border-[#012d1d] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Business Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:border-[#012d1d] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Phone Number{' '}
                  <span className="text-gray-400 font-normal">
                    (WhatsApp preferred)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+254 700 000 000"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:border-[#012d1d] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Acme Logistics Inc."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:border-[#012d1d] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:border-[#012d1d] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#012d1d] focus:ring-[#012d1d] cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link
                    href="/"
                    className="text-[#012d1d] font-semibold hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/"
                    className="text-[#012d1d] font-semibold hover:underline"
                  >
                    Privacy Policy.
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#012d1d] hover:bg-[#1b4332] disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:ring-offset-2 mt-2"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-[#012d1d] hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 py-4 px-8 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
        <div>
          <p className="text-sm font-bold text-gray-800">
            Smart Supply Sourcing China
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Smart Supply Sourcing China. All rights
            reserved.
          </p>
        </div>
        <div className="flex gap-6 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-gray-800 transition-colors">
            Global Trade Compliance
          </Link>
        </div>
      </footer>
    </div>
  );
}
