'use client';

import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus, PaymentRecord } from '@/types';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  loading?: boolean;
}

const statusColors: Record<PaymentStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'processing': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'pending-reconciliation': 'bg-orange-100 text-orange-800',
  'received': 'bg-blue-100 text-blue-800',
  'reconciled': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
};

const statusLabels: Record<PaymentStatus, string> = {
  'pending': 'Pending',
  'processing': 'Processing',
  'completed': 'Completed',
  'failed': 'Failed',
  'pending-reconciliation': 'Pending Reconciliation',
  'received': 'Received',
  'reconciled': 'Reconciled',
  'rejected': 'Rejected',
};

export function PaymentHistoryTable({ payments, loading }: PaymentHistoryTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Reference Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr
              key={payment.id}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-6 py-4">
                <div>
                  <p className="font-semibold text-gray-900">{payment.referenceCode}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payment.items.length} item{payment.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(payment.amount)}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700 capitalize">
                  {payment.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
                </p>
              </td>
              <td className="px-6 py-4">
                <Badge className={statusColors[payment.status]}>
                  {statusLabels[payment.status]}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
