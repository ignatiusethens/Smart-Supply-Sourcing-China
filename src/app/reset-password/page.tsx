'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check token validity on mount
  const isValidToken = token !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9faf6' }}
      >
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Reset Link
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            This password reset link is invalid or has expired. Please request a
            new password reset.
          </p>

          <div className="space-y-4">
            <Link
              href="/forgot-password"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold rounded-lg transition-colors"
            >
              Request New Reset Link
            </Link>

            <Link
              href="/login"
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Password Reset Successful
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Your password has been successfully reset. You can now log in with
            your new password.
          </p>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#012d1d] hover:bg-[#1b4332] text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Login
          </Link>
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>

            <p className="text-gray-600 leading-relaxed">
              Enter your new password below. Make sure it&apos;s strong and
              secure.
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
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 focus:border-[#012d1d] transition-all text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#012d1d]/20 focus:border-[#012d1d] transition-all text-sm"
              />
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-semibold">Password must contain:</p>
              <ul className="space-y-1 ml-4">
                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                  • At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  • One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  • One lowercase letter
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                  • One number
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#012d1d] hover:bg-[#1b4332] disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#012d1d] focus:ring-offset-2"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
