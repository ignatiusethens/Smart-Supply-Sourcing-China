'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-client';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  ShoppingCart,
} from 'lucide-react';

interface OrderRecord {
  id: string;
  referenceCode: string;
  buyer?: { name: string; email: string };
  buyerId: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: string;
  shippingCity: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [shippingModeFilter, setShippingModeFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/api/orders?admin=true');
      const data = await response.json();

      if (data.success) {
        setOrders(data.data?.data || data.data || []);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const getShipmentProgress = (orderStatus: string): number => {
    const statusMap: Record<string, number> = {
      'pending-payment': 1,
      'payment-received': 2,
      processing: 2,
      shipped: 3,
      completed: 5,
      cancelled: 0,
    };
    return statusMap[orderStatus] || 1;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      completed: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      reconciled: { label: 'Paid', className: 'bg-green-100 text-green-700' },
      pending: {
        label: 'Awaiting Payment',
        className: 'bg-yellow-100 text-yellow-700',
      },
      'pending-reconciliation': {
        label: 'Awaiting Payment',
        className: 'bg-yellow-100 text-yellow-700',
      },
      processing: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-700',
      },
      shipped: { label: 'Dispatched', className: 'bg-blue-100 text-blue-700' },
    };
    return (
      statusMap[status] || {
        label: status,
        className: 'bg-gray-100 text-gray-700',
      }
    );
  };

  const getShippingMode = (index: number): string => {
    const modes = ['Air', 'Sea', 'Air', 'Sea'];
    return modes[index % modes.length];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyer?.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const ShipmentProgressBar = ({ progress }: { progress: number }) => {
    const stages = [
      'Ordered',
      'Processing',
      'Shipped',
      'In Transit',
      'Delivered',
    ];

    return (
      <div className="min-w-[320px]">
        <div className="flex items-center">
          {stages.map((stage, index) => {
            const isCompleted = index < progress;
            const isFirst = index === 0;

            return (
              <div
                key={stage}
                className={`relative h-5 flex-1 flex items-center justify-center ${
                  isFirst ? '' : '-ml-2'
                }`}
                style={{
                  clipPath: isFirst
                    ? 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)'
                    : 'polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%, 10% 50%)',
                  backgroundColor: isCompleted ? '#2D5A3F' : '#D1D5DB',
                }}
              >
                {isCompleted && (
                  <Check
                    className="w-3 h-3 text-white font-bold"
                    strokeWidth={3}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {stages.map((stage) => (
            <span key={stage} className="text-[10px] text-gray-500 font-medium">
              {stage}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#2D5A3F]">
            Admin Orders & Shipments Tracker
          </h1>
        </header>

        {/* Filter Bar */}
        <div className="flex items-center space-x-3 mb-10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Orders, Tracking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2D5A3F] focus:border-[#2D5A3F] text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none block w-32 pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D5A3F] focus:border-[#2D5A3F] bg-white"
            >
              <option value="">Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* Shipping Mode Dropdown */}
          <div className="relative">
            <select
              value={shippingModeFilter}
              onChange={(e) => setShippingModeFilter(e.target.value)}
              className="appearance-none block w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D5A3F] focus:border-[#2D5A3F] bg-white"
            >
              <option value="">Shipping Mode</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="appearance-none block w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D5A3F] focus:border-[#2D5A3F] bg-white"
            >
              <option value="">Date Range</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* Filter Button */}
          <button className="bg-[#2D5A3F] text-white px-8 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Filter
          </button>
        </div>

        {/* Table Subtitle */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Active Purchase Orders
        </h2>

        {/* Data Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-gray-200">Supplier</th>
                <th className="px-6 py-3 border-b border-gray-200">
                  Tracking No.
                </th>
                <th className="px-6 py-3 border-b border-gray-200">
                  Shipping Mode
                </th>
                <th className="px-6 py-3 border-b border-gray-200">
                  Destination
                </th>
                <th className="px-6 py-3 border-b border-gray-200">
                  Payment Status
                </th>
                <th className="px-6 py-3 border-b border-gray-200">
                  Shipment Progress
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2D5A3F]" />
                      <span className="ml-3 text-gray-500">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery
                        ? 'Try adjusting your search'
                        : 'Orders will appear here'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => {
                  const paymentBadge = getPaymentStatusBadge(
                    order.paymentStatus
                  );
                  const progress = getShipmentProgress(order.orderStatus);
                  const shippingMode = getShippingMode(index);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-6 py-6 text-gray-800">
                        {order.buyer?.name || 'Unknown Supplier'}
                      </td>
                      <td className="px-6 py-6 text-gray-600 font-mono">
                        {order.referenceCode}
                      </td>
                      <td className="px-6 py-6 text-gray-600">
                        {shippingMode}
                      </td>
                      <td className="px-6 py-6 text-gray-600">
                        {order.shippingCity || 'N/A'}
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <ShipmentProgressBar progress={progress} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredOrders.length > 0 && (
          <footer className="mt-8 flex items-center justify-end space-x-6 text-sm text-gray-600">
            <span className="text-gray-500">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}
