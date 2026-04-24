'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password');
        return;
      }
      login(data.user, data.token);
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9faf6' }}
    >
      <main className="flex-grow flex flex-col md:flex-row">
        {/* ── LEFT: Shipping port photo ── */}
        <section className="hidden md:flex md:w-1/2 lg:w-7/12 relative items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-[#012d1d]/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#012d1d]/80 to-transparent" />
          </div>
          <div className="relative z-10 p-12 max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Sourcing Made Simple
            </h1>
            <p className="text-lg text-[#a5d0b9] leading-relaxed">
              Reliable cross-border efficiency and industrial authority,
              connecting you to the heart of global manufacturing.
            </p>
            <div className="mt-12 flex gap-12">
              <div className="flex flex-col gap-1">
                <span className="text-white text-3xl font-bold">15k+</span>
                <span className="text-[#a5d0b9] text-xs font-semibold uppercase tracking-widest">
                  Verified Suppliers
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white text-3xl font-bold">180+</span>
                <span className="text-[#a5d0b9] text-xs font-semibold uppercase tracking-widest">
                  Countries Reached
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT: Login form ── */}
        <section className="w-full md:w-1/2 lg:w-5/12 bg-white flex flex-col justify-center px-6 md:px-16 py-12">
          <div className="max-w-md w-full mx-auto">
            {/* Brand */}
            <div className="mb-12">
              <span className="text-xl font-bold text-[#012d1d] tracking-tight">
                Smart Supply Sourcing China
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-base text-gray-500">
                Access your professional sourcing dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-600 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 focus:border-[#012d1d] transition-all text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-600"
                  >
                    Password
                  </label>
                  <Link
                    href="/"
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 focus:border-[#012d1d] transition-all text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-[#012d1d] focus:ring-[#012d1d] border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-500 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#012d1d] hover:bg-[#1b4332] disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:ring-offset-2"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-400 font-medium uppercase tracking-widest">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social buttons — dormant */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                <span className="text-sm font-semibold text-gray-700">
                  Google
                </span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2 text-[#0077b5]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">
                  LinkedIn
                </span>
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-orange-500 font-semibold hover:underline underline-offset-4 decoration-2"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <span className="text-base font-semibold text-gray-900">
            Smart Supply Sourcing China
          </span>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              'Privacy Policy',
              'Terms of Service',
              'Cookie Settings',
              'Global Trade Compliance',
            ].map((l) => (
              <Link
                key={l}
                href="/"
                className="text-xs text-gray-500 hover:text-[#012d1d] hover:underline transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} Smart Supply Sourcing China. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
