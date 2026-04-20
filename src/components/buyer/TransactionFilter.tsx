'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types';

interface TransactionItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Transaction {
  id: string;
  orderId: string;
  referenceCode: string;
  amount: number;
  method: 'mpesa' | 'bank-transfer';
  status: PaymentStatus;
  items: TransactionItem[];
  createdAt: string;
  updatedAt: string;
}

interface TransactionFilterProps {
  userId: string;
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

const statusOptions: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Transactions' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending-reconciliation', label: 'Pending Reconciliation' },
  { value: 'received', label: 'Received' },
  { value: 'reconciled', label: 'Reconciled' },
  { value: 'rejected', label: 'Rejected' },
];

export function TransactionFilter({ userId }: TransactionFilterProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const statusParam = selectedStatus === 'all' ? '' : `&status=${selectedStatus}`;
        const response = await fetch(
          `/api/orders/dashboard/transactions?userId=${userId}${statusParam}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setTransactions(data.data.transactions || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, selectedStatus]);

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

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setSelectedStatus(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map(transaction => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Transaction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {transaction.referenceCode}
                    </h3>
                    <Badge className={statusColors[transaction.status]}>
                      {statusLabels[transaction.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.createdAt)} • {transaction.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              {transaction.items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                    Items
                  </p>
                  <div className="space-y-1">
                    {transaction.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.productName}</span>
                        <span className="text-gray-600">x{item.quantity}</span>
                      </div>
                    ))}
                    {transaction.items.length > 2 && (
                      <p className="text-xs text-gray-500 italic">
                        +{transaction.items.length - 2} more item
                        {transaction.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            {selectedStatus === 'all'
              ? 'No transactions yet'
              : `No transactions with status "${statusLabels[selectedStatus as PaymentStatus]}"`}
          </p>
        </div>
      )}
    </div>
  );
}
