'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const { user } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRequest, setSubmittedRequest] =
    useState<SourcingRequest | null>(null);

  const buyerId = user?.id || '';

  const handleSuccess = (request: SourcingRequest) => {
    setSubmittedRequest(request);
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  // ── Page 11: Confirmation screen ──────────────────────────────────────────
  if (submittedRequest) {
    // Generate a display reference like SR-99201 from the real ID
    const refDisplay = `SR-${submittedRequest.id.slice(-5).toUpperCase()}`;

    return (
      <BuyerLayout>
        <div className="min-h-screen bg-slate-50 py-16 px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* ── Hero confirmation card ── */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-4">
              {/* Large checkmark */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle
                    className="w-12 h-12 text-green-600"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Request Successfully Submitted
              </h1>

              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
                Your sourcing request for{' '}
                <span className="font-semibold text-slate-800">
                  Ref: {refDisplay}
                </span>{' '}
                has been received. Our team will verify availability and provide
                a formal quote.
              </p>

              {/* Status badges */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"
                    aria-hidden="true"
                  />
                  Pending Reconciliation
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium">
                  Estimated quote delivery: 2–4 hours
                </span>
              </div>
            </div>

            {/* ── Accepted deposit methods ── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Accepted Deposit Methods
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      M-Pesa
                    </p>
                    <p className="text-xs text-green-700 font-medium">
                      Instant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Bank Transfer
                    </p>
                    <p className="text-xs text-slate-500">1–3 Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Action cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pro-Forma Invoice */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText
                      className="w-5 h-5 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    Pro-Forma Invoice
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">
                  Request a formal bank invoice with payment details for your
                  records.
                </p>
                <button
                  onClick={() => router.push('/sourcing/quote')}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  Request Bank Invoice
                </button>
              </div>

              {/* Order Tracking */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard
                      className="w-5 h-5 text-slate-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    Order Tracking
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">
                  Monitor your sourcing request status and updates from your
                  dashboard.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>

            {/* ── Trust badges ── */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Headphones
                  className="w-4 h-4 text-green-600"
                  aria-hidden="true"
                />
                <span className="font-medium">24/7 Support Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span className="font-medium">Secure B2B Portal</span>
              </div>
            </div>

            {/* Submit another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setErrorMessage('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  // ── Page 10: Sourcing Form ────────────────────────────────────────────────
  return (
    <BuyerLayout>
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                B2B Sourcing
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Sourcing Form
            </h1>
            <p className="text-slate-600 max-w-xl">
              Submit your procurement requirements. Our team will verify
              availability and provide a formal quote.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
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
