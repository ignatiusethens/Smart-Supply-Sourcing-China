'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

interface SourcingRequest {
  id: string;
  title: string;
  category: string;
  status:
    | 'draft'
    | 'submitted'
    | 'under-review'
    | 'quote-ready'
    | 'accepted'
    | 'rejected';
  submittedDate: string;
  estimatedValue: number;
  supplier?: string;
  lastUpdate: string;
}

const mockRequests: SourcingRequest[] = [
  {
    id: '5521',
    title: 'Electronics Components',
    category: 'Electronics',
    status: 'quote-ready',
    submittedDate: '2023-10-15',
    estimatedValue: 12500,
    supplier: 'Shenzhen Tech Co.',
    lastUpdate: '2023-10-20',
  },
  {
    id: '5543',
    title: 'Solar Panels',
    category: 'Energy',
    status: 'under-review',
    submittedDate: '2023-10-18',
    estimatedValue: 25000,
    lastUpdate: '2023-10-19',
  },
  {
    id: '5576',
    title: 'Textile Machinery',
    category: 'Machinery',
    status: 'submitted',
    submittedDate: '2023-10-20',
    estimatedValue: 45000,
    lastUpdate: '2023-10-20',
  },
  {
    id: '5598',
    title: 'LED Display Screens',
    category: 'Electronics',
    status: 'accepted',
    submittedDate: '2023-10-10',
    estimatedValue: 18000,
    supplier: 'Guangzhou Display Ltd.',
    lastUpdate: '2023-10-22',
  },
];

function StatusBadge({ status }: { status: SourcingRequest['status'] }) {
  const config = {
    draft: {
      label: 'Draft',
      className: 'bg-gray-100 text-gray-700',
      icon: FileText,
    },
    submitted: {
      label: 'Submitted',
      className: 'bg-blue-100 text-blue-700',
      icon: Clock,
    },
    'under-review': {
      label: 'Under Review',
      className: 'bg-yellow-100 text-yellow-700',
      icon: Eye,
    },
    'quote-ready': {
      label: 'Quote Ready',
      className: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-[#4ade80]/20 text-[#1a3020]',
      icon: CheckCircle,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-700',
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

export default function SourcingRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-[#1a3020] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Sourcing Requests</h1>
              <p className="text-gray-300 text-sm">
                Manage your procurement requests and track their progress
              </p>
            </div>
            <Link
              href="/sourcing/request"
              className="bg-[#f0ad4e] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Total Requests
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#4ade80]">1</div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Quote Ready
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#f0ad4e]">2</div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                In Progress
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">$100,500</div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Total Value
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
                  placeholder="Search requests..."
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
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under-review">Under Review</option>
                <option value="quote-ready">Quote Ready</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request #{request.id} - {request.title}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Submitted:{' '}
                      {new Date(request.submittedDate).toLocaleDateString()}
                    </span>
                    <span>Category: {request.category}</span>
                    <span>
                      Est. Value: ${request.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                  {request.supplier && (
                    <div className="mt-2 text-sm text-gray-600">
                      Supplier:{' '}
                      <span className="font-medium">{request.supplier}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/sourcing/${request.id}`}
                    className="px-4 py-2 bg-[#1a3020] text-white rounded-lg hover:bg-[#2d4a35] transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Last updated:{' '}
                  {new Date(request.lastUpdate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  {request.status === 'quote-ready' && (
                    <span className="text-xs text-[#4ade80] font-semibold">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first sourcing request'}
            </p>
            <Link
              href="/sourcing/request"
              className="inline-flex items-center gap-2 bg-[#1a3020] text-white px-6 py-3 rounded-lg hover:bg-[#2d4a35] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Request
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
