'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { SourcingRequestForm } from '@/components/buyer/SourcingRequestForm';
import { SourcingRequest } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  CheckCircle,
  FileText,
  LayoutDashboard,
  Shield,
  Headphones,
} from 'lucide-react';

export default function SourcingRequestPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRequest, setSubmittedRequest] =
    useState<SourcingRequest | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const buyerId = user?.id || '';

  const handleSuccess = (request: SourcingRequest) => {
    setSubmittedRequest(request);
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  // ── Confirmation screen ──────────────────────────────────────────
  if (submittedRequest) {
    const refDisplay = `SR-${submittedRequest.id.slice(-5).toUpperCase()}`;

    return (
      <BuyerLayout>
        <div className="min-h-screen bg-[#f0faf6] py-16 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-[#e8f4f0] flex items-center justify-center">
                  <CheckCircle
                    className="w-12 h-12 text-[#1a6b50]"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Request Successfully Submitted
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                Your sourcing request{' '}
                <span className="font-semibold text-gray-800">
                  Ref: {refDisplay}
                </span>{' '}
                has been received. Our team will verify availability and provide
                a formal quote.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"
                    aria-hidden="true"
                  />
                  Pending Reconciliation
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium">
                  Estimated quote delivery: 2–4 hours
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Accepted Deposit Methods
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      M-Pesa
                    </p>
                    <p className="text-xs text-green-700 font-medium">
                      Instant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Bank Transfer
                    </p>
                    <p className="text-xs text-gray-500">1–3 Days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e8f4f0] flex items-center justify-center flex-shrink-0">
                    <FileText
                      className="w-5 h-5 text-[#1a6b50]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Pro-Forma Invoice
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  Request a formal bank invoice with payment details for your
                  records.
                </p>
                <button
                  onClick={() => router.push('/sourcing/quote')}
                  className="w-full px-4 py-2.5 bg-[#1a6b50] hover:bg-[#155a42] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Request Bank Invoice
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard
                      className="w-5 h-5 text-gray-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Order Tracking
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  Monitor your sourcing request status and updates from your
                  dashboard.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Headphones
                  className="w-4 h-4 text-[#1a6b50]"
                  aria-hidden="true"
                />
                <span className="font-medium">24/7 Support Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-[#1a6b50]" aria-hidden="true" />
                <span className="font-medium">Secure B2B Portal</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setErrorMessage('');
                }}
                className="text-sm text-[#1a6b50] hover:text-[#155a42] font-medium underline underline-offset-2"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  // ── Sourcing Form ────────────────────────────────────────────────
  return (
    <BuyerLayout>
      <div className="min-h-screen bg-[#f0faf6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb + trust badge */}
          <div className="flex items-center gap-3 mb-6 text-xs text-gray-500">
            <Link
              href="/sourcing"
              className="text-[#1a6b50] font-semibold hover:underline"
            >
              Sourcing Service
            </Link>
            <span>›</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Trusted by 500+ Kenyan Businesses
            </span>
          </div>

          {/* Page title + step indicator */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Sourcing Form
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="text-[#1a6b50]">Step 1: Request</span>
              <span className="text-gray-300">›</span>
              <span className="text-gray-400">Step 2: Quotation</span>
              <span className="text-gray-300">›</span>
              <span className="text-gray-400">Step 3: Fulfilment</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          <SourcingRequestForm
            buyerId={buyerId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </BuyerLayout>
  );
}
