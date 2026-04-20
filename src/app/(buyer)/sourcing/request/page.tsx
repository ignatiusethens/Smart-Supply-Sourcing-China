'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { SourcingRequestForm } from '@/components/buyer/SourcingRequestForm';
import { SourcingRequest } from '@/types';
import { Card } from '@/components/ui/card';

export default function SourcingRequestPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedRequest, setSubmittedRequest] = useState<SourcingRequest | null>(null);

  // TODO: Get actual buyer ID from auth context
  const buyerId = 'test-buyer-id';

  const handleSuccess = (request: SourcingRequest) => {
    setSubmittedRequest(request);
    setSuccessMessage('Sourcing request submitted successfully!');
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
  };

  return (
    <BuyerLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Custom Sourcing Request</h1>
            <p className="text-gray-600">
              Can't find what you need in our catalog? Submit a custom sourcing request and our team will find the best options for you.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Card className="mb-6 p-4 bg-green-50 border border-green-200">
              <p className="text-green-800">{successMessage}</p>
            </Card>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Card className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-800">{errorMessage}</p>
            </Card>
          )}

          {/* Confirmation Page */}
          {submittedRequest ? (
            <Card className="p-6 mb-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Request Submitted Successfully</h2>
                <p className="text-gray-600 mb-4">
                  Your sourcing request has been received. Our team will review it and send you a quote within 24-48 hours.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Request Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-mono font-semibold">{submittedRequest.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span>{submittedRequest.itemDescription}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span>{submittedRequest.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Location:</span>
                    <span>{submittedRequest.deliveryLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                      {submittedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              {submittedRequest.attachments && submittedRequest.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Attached Files</h3>
                  <ul className="space-y-2">
                    {submittedRequest.attachments.map((attachment) => (
                      <li key={attachment.id} className="text-sm text-gray-600">
                        📎 {attachment.fileName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/sourcing/quote')}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  View My Quotes
                </button>
                <button
                  onClick={() => {
                    setSubmittedRequest(null);
                    setSuccessMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium"
                >
                  Submit Another Request
                </button>
              </div>
            </Card>
          ) : (
            <SourcingRequestForm
              buyerId={buyerId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {/* Info Section */}
          <Card className="mt-8 p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-3">What Happens Next?</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">1.</span>
                <span>Our sourcing team reviews your request within 24 hours</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">2.</span>
                <span>We search our supplier network for the best options</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">3.</span>
                <span>You receive a formal quote with pricing and terms</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">4.</span>
                <span>Accept the quote and proceed to payment</span>
              </li>
            </ol>
          </Card>
        </div>
      </div>
    </BuyerLayout>
  );
}
