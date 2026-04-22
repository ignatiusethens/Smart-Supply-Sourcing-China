'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BuyerLayout } from '@/components/layout/BuyerLayout';
import { QuoteReviewCard } from '@/components/buyer/QuoteReviewCard';
import { Quote, PaymentMethod } from '@/types';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api/auth-client';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await authFetch(`/api/quotes/${quoteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        const result = await response.json();
        setQuote(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    };

    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const handleAcceptQuote = async (paymentMethod: PaymentMethod) => {
    if (!quote) return;

    setIsAccepting(true);
    try {
      const response = await authFetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept quote');
      }

      const result = await response.json();

      // Redirect to payment page with order ID
      router.push(
        `/checkout?orderId=${result.data.orderId}&referenceCode=${result.data.referenceCode}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept quote');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 text-center">
              <p className="text-gray-600">Loading quote...</p>
            </Card>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (error || !quote) {
    return (
      <BuyerLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 bg-red-50 border border-red-200">
              <p className="text-red-800 mb-4">{error || 'Quote not found'}</p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Go Back
              </button>
            </Card>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Card className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-red-800">{error}</p>
            </Card>
          )}

          <QuoteReviewCard
            quote={quote}
            onAccept={handleAcceptQuote}
            onError={setError}
            isLoading={isAccepting}
          />

          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </BuyerLayout>
  );
}
