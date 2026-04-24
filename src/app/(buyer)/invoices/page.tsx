'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  FileText,
  Upload,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod: 'mpesa' | 'bank-transfer' | 'pending';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  supplier: string;
  downloadUrl?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-1045',
    orderId: 'ORD-5521',
    description: 'Electronics Components',
    amount: 12500,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'pending',
    issueDate: '2023-10-20',
    dueDate: '2023-10-25',
    supplier: 'Shenzhen Tech Co.',
  },
  {
    id: '2',
    invoiceNumber: 'INV-1038',
    orderId: 'ORD-5598',
    description: 'LED Display Screens',
    amount: 5200,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'bank-transfer',
    issueDate: '2023-10-15',
    dueDate: '2023-10-20',
    paidDate: '2023-10-19',
    supplier: 'Guangzhou Display Ltd.',
    downloadUrl: '/receipts/INV-1038.pdf',
  },
  {
    id: '3',
    invoiceNumber: 'INV-1039',
    orderId: 'ORD-5432',
    description: 'Solar Panel Components',
    amount: 8900,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'mpesa',
    issueDate: '2023-10-10',
    dueDate: '2023-10-15',
    paidDate: '2023-10-14',
    supplier: 'Shanghai Solar Ltd.',
    downloadUrl: '/receipts/INV-1039.pdf',
  },
  {
    id: '4',
    invoiceNumber: 'INV-1052',
    orderId: 'ORD-5543',
    description: 'Solar Panels',
    amount: 25000,
    currency: 'USD',
    status: 'processing',
    paymentMethod: 'bank-transfer',
    issueDate: '2023-10-22',
    dueDate: '2023-10-27',
    supplier: 'Beijing Energy Co.',
  },
];

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const config = {
    pending: {
      label: 'Pending',
      className: 'bg-[#f0ad4e]/20 text-[#f0ad4e]',
      icon: Clock,
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-100 text-blue-700',
      icon: Clock,
    },
    paid: {
      label: 'Paid',
      className: 'bg-[#4ade80]/20 text-[#1a3020]',
      icon: CheckCircle,
    },
    overdue: {
      label: 'Overdue',
      className: 'bg-red-100 text-red-700',
      icon: AlertCircle,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-700',
      icon: AlertCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: Invoice['paymentMethod'] }) {
  const config = {
    mpesa: {
      label: 'M-Pesa',
      className: 'bg-green-100 text-green-700',
      icon: 'M',
    },
    'bank-transfer': {
      label: 'Bank Transfer',
      className: 'bg-blue-100 text-blue-700',
      icon: 'B',
    },
    pending: {
      label: 'Payment Pending',
      className: 'bg-gray-100 text-gray-700',
      icon: '?',
    },
  };

  const { label, className, icon } = config[method];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${className}`}
      >
        {icon}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = mockInvoices
    .filter((i) => ['pending', 'processing', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPaid = mockInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingCount = mockInvoices.filter(
    (i) => i.status === 'pending'
  ).length;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-[#1a3020] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Invoices & Payments</h1>
            <p className="text-gray-300 text-sm">
              Manage your pro-forma invoices and payment history
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#f0ad4e]">
                ${totalOutstanding.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Outstanding Balance
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#4ade80]">
                ${totalPaid.toLocaleString()}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Total Paid
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {pendingCount}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Pending Payments
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {mockInvoices.length}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Total Invoices
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto -mt-8 px-8 pb-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3020] focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3020] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </h3>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>Order: {invoice.orderId}</span>
                    <span>{invoice.description}</span>
                    <span>Supplier: {invoice.supplier}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                    {invoice.paidDate && (
                      <span className="flex items-center gap-1 text-[#4ade80]">
                        <CheckCircle className="w-4 h-4" />
                        Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${invoice.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.currency}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <PaymentMethodBadge method={invoice.paymentMethod} />

                <div className="flex items-center gap-2">
                  {invoice.status === 'pending' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="w-4 h-4" />
                        Pay with M-Pesa
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="w-4 h-4" />
                        Bank Transfer
                      </button>
                    </>
                  )}

                  {invoice.status === 'processing' &&
                    invoice.paymentMethod === 'bank-transfer' && (
                      <button className="px-4 py-2 bg-[#f0ad4e] text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2 text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        Upload Proof
                      </button>
                    )}

                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>

                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>

                  {invoice.downloadUrl && (
                    <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your invoices will appear here once orders are confirmed'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
