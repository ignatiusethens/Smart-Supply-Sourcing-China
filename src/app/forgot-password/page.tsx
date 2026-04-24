'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);

      // In development, show the reset link
      if (process.env.NODE_ENV === 'development' && data.resetLink) {
        console.log('Password reset link:', data.resetLink);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9faf6' }}
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            We&apos;ve sent a password reset link to <strong>{email}</strong>.
            Please check your email and follow the instructions to reset your
            password.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold rounded-lg transition-colors"
            >
              Back to Login
            </Link>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Try a different email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9faf6' }}
    >
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Back to Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>

            <p className="text-gray-600 leading-relaxed">
              No worries! Enter your email address and we&apos;ll send you a
              link to reset your password.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 focus:border-[#012d1d] transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#012d1d] hover:bg-[#1b4332] disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:ring-offset-2"
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-orange-500 font-semibold hover:underline underline-offset-4 decoration-2"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 text-center bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          © {new Date().getFullYear()} Smart Supply Sourcing China. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
