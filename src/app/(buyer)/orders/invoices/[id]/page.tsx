'use client';

import { InvoiceDownload } from '@/components/buyer/InvoiceDownload';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const [paramId, setParamId] = useState<string>('');

  useEffect(() => {
    params.then(p => setParamId(p.id));
  }, [params]);

  if (!paramId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/dashboard">
          <button className="text-blue-600 hover:text-blue-700 font-medium mb-6">
            ← Back to Dashboard
          </button>
        </Link>

        {/* Invoice */}
        <InvoiceDownload invoiceId={paramId} />
      </div>
    </div>
  );
}
