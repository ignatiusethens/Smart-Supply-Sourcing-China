'use client';
import { authFetch } from '@/lib/api/auth-client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface SourcingRequestRecord {
  id: string;
  itemDescription: string;
  quantity: number;
  buyerName: string;
  status: string;
  createdAt: string;
}

export default function SourcingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<SourcingRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) {
          params.append('status', statusFilter);
        }

        const response = await authFetch(
          `/api/sourcing/requests?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setRequests(data.data || []);
        } else {
          console.error('Failed to fetch sourcing requests:', data.error);
        }
      } catch (error) {
        console.error('Error fetching sourcing requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [statusFilter]);

  const filteredRequests = requests.filter(
    (request) =>
      request.itemDescription
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    'under-review': 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sourcing Requests Management
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage custom sourcing requests from buyers
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by item description or buyer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent bg-white"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Request ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Item Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Buyer Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date Submitted
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a27]"></div>
                      <span className="ml-3">Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">
                      No sourcing requests found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery || statusFilter
                        ? 'Try adjusting your search or filters'
                        : 'Sourcing requests will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      #{request.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={request.itemDescription}>
                        {request.itemDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.quantity.toLocaleString()} units
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.buyerName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[request.status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          router.push(`/admin/sourcing/${request.id}`)
                        }
                        className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234520] transition-colors"
                      >
                        Detail View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredRequests.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{' '}
              {Math.min(endIndex, filteredRequests.length)} of{' '}
              {filteredRequests.length} requests
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[#2d5a27] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
