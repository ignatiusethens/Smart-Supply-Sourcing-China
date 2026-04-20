'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Search, Filter } from 'lucide-react';

interface LedgerRecord {
  id: string;
  paymentId: string;
  referenceCode: string;
  buyerName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  reconciliationStatus: string;
  orderDate: string;
  proofCount: number;
}

interface LedgerTableProps {
  records: LedgerRecord[];
  total: number;
  page: number;
  limit: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onStatusFilterChange?: (statuses: string[]) => void;
  onSearchChange?: (query: string) => void;
  onRecordSelect?: (paymentId: string) => void;
}

const statusColors: Record<string, string> = {
  'pending-reconciliation': 'bg-yellow-100 text-yellow-800',
  'received': 'bg-blue-100 text-blue-800',
  'reconciled': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'pending': 'bg-gray-100 text-gray-800',
  'processing': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
};

const paymentMethodLabels: Record<string, string> = {
  'mpesa': 'M-Pesa',
  'bank-transfer': 'Bank Transfer',
};

export function LedgerTable({
  records,
  total,
  page,
  limit,
  isLoading = false,
  onPageChange,
  onStatusFilterChange,
  onSearchChange,
  onRecordSelect,
}: LedgerTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    onStatusFilterChange?.(newStatuses);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by reference code or buyer name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Reconciliation Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {['pending-reconciliation', 'received', 'reconciled', 'rejected'].map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Buyer</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Proofs</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-600">
                    {record.referenceCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.buyerName}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {paymentMethodLabels[record.paymentMethod] || record.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge className={`${statusColors[record.reconciliationStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {record.reconciliationStatus.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    <Badge variant="outline">{record.proofCount}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(record.orderDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRecordSelect?.(record.paymentId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange?.(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
