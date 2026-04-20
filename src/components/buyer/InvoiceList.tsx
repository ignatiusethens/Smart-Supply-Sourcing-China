'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Invoice {
  id: string;
  referenceCode: string;
  totalAmount: number;
  depositAmount?: number;
  paymentMethod: 'mpesa' | 'bank-transfer';
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceListProps {
  userId: string;
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'pending-reconciliation': 'bg-orange-100 text-orange-800',
  'received': 'bg-blue-100 text-blue-800',
  'reconciled': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  'pending': 'Pending',
  'processing': 'Processing',
  'completed': 'Completed',
  'failed': 'Failed',
  'pending-reconciliation': 'Pending Reconciliation',
  'received': 'Received',
  'reconciled': 'Reconciled',
  'rejected': 'Rejected',
};

export function InvoiceList({ userId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/orders/invoices?userId=${userId}&page=${page}&limit=10`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setInvoices(data.data.data || []);
          setTotalPages(data.data.pagination.totalPages);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [userId, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No invoices available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map(invoice => (
        <div
          key={invoice.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Invoice Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Invoice #{invoice.referenceCode}
                </h3>
                <Badge className={statusColors[invoice.paymentStatus] || 'bg-gray-100 text-gray-800'}>
                  {statusLabels[invoice.paymentStatus] || invoice.paymentStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(invoice.createdAt)} • {invoice.items.length} item
                {invoice.items.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>

              {/* Actions */}
              <Link href={`/orders/invoices/${invoice.id}`}>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
                  aria-label={`View and download invoice ${invoice.referenceCode} for ${formatCurrency(invoice.totalAmount)}`}
                >
                  View & Download
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-6" aria-label="Invoice pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <div className="flex items-center gap-2" role="group" aria-label="Page numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-lg min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Go to page ${p}`}
                aria-current={page === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]"
            aria-label="Go to next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
