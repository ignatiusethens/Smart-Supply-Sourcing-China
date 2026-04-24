'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Truck,
  Plane,
  Ship,
  Package,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Calendar,
} from 'lucide-react';

interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  description: string;
  method: 'air' | 'sea';
  status:
    | 'picked-up'
    | 'in-transit'
    | 'customs'
    | 'out-for-delivery'
    | 'delivered'
    | 'delayed';
  origin: string;
  destination: string;
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  carrier: string;
  weight: string;
  dimensions: string;
  hasAlert?: boolean;
  alertMessage?: string;
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'AF9982',
    orderId: 'ORD-5521',
    description: 'Electronics Components',
    method: 'air',
    status: 'in-transit',
    origin: 'Shenzhen, China',
    destination: 'Nairobi, Kenya',
    currentLocation: 'Dubai, UAE',
    estimatedDelivery: '2023-11-10',
    carrier: 'DHL Express',
    weight: '25.5 kg',
    dimensions: '60x40x30 cm',
  },
  {
    id: '2',
    trackingNumber: 'SF7710',
    orderId: 'ORD-5598',
    description: 'LED Display Screens',
    method: 'sea',
    status: 'customs',
    origin: 'Guangzhou, China',
    destination: 'Mombasa, Kenya',
    currentLocation: 'Mombasa Port',
    estimatedDelivery: '2023-11-15',
    carrier: 'COSCO Shipping',
    weight: '450 kg',
    dimensions: '200x120x80 cm',
    hasAlert: true,
    alertMessage: 'Customs clearance required - documentation needed',
  },
  {
    id: '3',
    trackingNumber: 'AF8834',
    orderId: 'ORD-5432',
    description: 'Solar Panel Components',
    method: 'air',
    status: 'delivered',
    origin: 'Shanghai, China',
    destination: 'Nairobi, Kenya',
    currentLocation: 'Delivered',
    estimatedDelivery: '2023-10-25',
    actualDelivery: '2023-10-24',
    carrier: 'Emirates SkyCargo',
    weight: '180 kg',
    dimensions: '150x100x50 cm',
  },
];

function ShipmentMethodIcon({ method }: { method: 'air' | 'sea' }) {
  return method === 'air' ? (
    <Plane className="w-4 h-4 text-blue-600" />
  ) : (
    <Ship className="w-4 h-4 text-blue-800" />
  );
}

function StatusBadge({ status }: { status: Shipment['status'] }) {
  const config = {
    'picked-up': {
      label: 'Picked Up',
      className: 'bg-blue-100 text-blue-700',
      icon: Package,
    },
    'in-transit': {
      label: 'In Transit',
      className: 'bg-yellow-100 text-yellow-700',
      icon: Truck,
    },
    customs: {
      label: 'At Customs',
      className: 'bg-orange-100 text-orange-700',
      icon: Clock,
    },
    'out-for-delivery': {
      label: 'Out for Delivery',
      className: 'bg-green-100 text-green-700',
      icon: Truck,
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-[#4ade80]/20 text-[#1a3020]',
      icon: CheckCircle,
    },
    delayed: {
      label: 'Delayed',
      className: 'bg-red-100 text-red-700',
      icon: AlertTriangle,
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

export default function ShipmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeShipments = mockShipments.filter(
    (s) => !['delivered'].includes(s.status)
  ).length;
  const inTransit = mockShipments.filter(
    (s) => s.status === 'in-transit'
  ).length;
  const needsAttention = mockShipments.filter((s) => s.hasAlert).length;

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="bg-[#1a3020] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Shipment Tracking</h1>
            <p className="text-gray-300 text-sm">
              Monitor your orders from supplier to delivery
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {activeShipments}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Active Shipments
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#4ade80]">
                {inTransit}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                In Transit
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#f0ad4e]">
                {needsAttention}
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Needs Attention
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-xs text-gray-300 uppercase tracking-wide">
                Total Shipments
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
                  placeholder="Search by tracking number or order ID..."
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
                <option value="picked-up">Picked Up</option>
                <option value="in-transit">In Transit</option>
                <option value="customs">At Customs</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-6">
          {filteredShipments.map((shipment) => (
            <div
              key={shipment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Alert Banner */}
              {shipment.hasAlert && (
                <div className="bg-[#f0ad4e]/10 border-b border-[#f0ad4e]/30 px-6 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f0ad4e]" />
                    <span className="text-sm font-medium text-orange-800">
                      {shipment.alertMessage}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ShipmentMethodIcon method={shipment.method} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {shipment.description}
                      </h3>
                      <StatusBadge status={shipment.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        Tracking:{' '}
                        <span className="font-mono font-medium">
                          {shipment.trackingNumber}
                        </span>
                      </span>
                      <span>Order: {shipment.orderId}</span>
                      <span>Carrier: {shipment.carrier}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Track External
                  </button>
                </div>

                {/* Route and Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Route */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Route</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">{shipment.origin}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-[#4ade80]" />
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">
                          {shipment.currentLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">
                          {shipment.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Shipment Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{shipment.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">
                          {shipment.dimensions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Delivery:</span>
                        <span className="font-medium">
                          {new Date(
                            shipment.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {shipment.actualDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivered:</span>
                          <span className="font-medium text-[#4ade80]">
                            {new Date(
                              shipment.actualDelivery
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Delivery Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {shipment.status === 'delivered'
                        ? '100%'
                        : shipment.status === 'out-for-delivery'
                          ? '90%'
                          : shipment.status === 'customs'
                            ? '70%'
                            : shipment.status === 'in-transit'
                              ? '50%'
                              : '25%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        shipment.status === 'delivered'
                          ? 'bg-[#4ade80] w-full'
                          : shipment.status === 'out-for-delivery'
                            ? 'bg-[#4ade80] w-[90%]'
                            : shipment.status === 'customs'
                              ? 'bg-[#f0ad4e] w-[70%]'
                              : shipment.status === 'in-transit'
                                ? 'bg-blue-500 w-1/2'
                                : 'bg-blue-500 w-1/4'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Last updated: 2 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    {shipment.hasAlert && (
                      <button className="px-4 py-2 bg-[#f0ad4e] text-white rounded-lg hover:bg-orange-500 transition-colors text-sm font-medium">
                        Resolve Issue
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      View Timeline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShipments.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shipments found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your shipments will appear here once orders are processed'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
