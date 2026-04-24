'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { SourcingRequestWizard } from '@/components/buyer/SourcingRequestWizard';
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
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedRequest, setSubmittedRequest] =
    useState<SourcingRequest | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const handleSuccess = (request: SourcingRequest) => {
    setSubmittedRequest(request);
    setErrorMessage('');
  };

  // ── Confirmation ──────────────────────────────────────────────────
  if (submittedRequest) {
    const refDisplay = `SR-${submittedRequest.id.slice(-5).toUpperCase()}`;
    return (
      <BuyerLayout>
        <div className="min-h-screen bg-gray-50 py-16 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle
                    className="w-12 h-12 text-[#053018]"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Pending Review
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium">
                  Estimated quote: 2–4 hours
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#053018]" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Pro-Forma Invoice
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  Request a formal bank invoice with payment details.
                </p>
                <button
                  onClick={() => router.push('/sourcing/quote')}
                  className="w-full px-4 py-2.5 bg-[#053018] hover:bg-[#1b4332] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Request Bank Invoice
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Order Tracking
                  </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  Monitor your sourcing request from your dashboard.
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
                <Headphones className="w-4 h-4 text-[#053018]" />
                <span className="font-medium">24/7 Support Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-[#053018]" />
                <span className="font-medium">Secure B2B Portal</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setSubmittedRequest(null);
                  setErrorMessage('');
                }}
                className="text-sm text-[#053018] hover:underline font-medium"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <SourcingRequestWizard
        buyerId={user?.id || ''}
        onSuccess={handleSuccess}
        onError={setErrorMessage}
        errorMessage={errorMessage}
      />
    </BuyerLayout>
  );
}
