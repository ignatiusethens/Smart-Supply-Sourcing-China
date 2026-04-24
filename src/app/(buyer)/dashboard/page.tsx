'use client';

import React from 'react';
import Link from 'next/link';
import {
  PieChart,
  FileText,
  Truck,
  Receipt,
  Check,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a3020] text-white flex flex-col flex-shrink-0">
        {/* Logo Section */}
        <div className="p-6 mb-4 flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#2d4a35] border border-gray-600 flex items-center justify-center text-xs font-bold text-[#4ade80] tracking-tighter">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Smart Supply</h1>
            <p className="text-[10px] text-gray-400 tracking-wider uppercase">
              Sourcing China
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 bg-[#2d4a35] px-5 py-3 rounded-full text-sm font-medium transition-colors"
          >
            <PieChart className="text-white text-[20px]" />
            <span className="text-white">Dashboard</span>
          </Link>
          <Link
            href="/sourcing"
            className="flex items-center space-x-3 hover:bg-[#2d4a35]/50 px-5 py-3 rounded-full text-sm text-gray-300 transition-colors"
          >
            <FileText className="text-gray-400 text-[20px]" />
            <span>Requests</span>
          </Link>
          <Link
            href="/shipments"
            className="flex items-center space-x-3 hover:bg-[#2d4a35]/50 px-5 py-3 rounded-full text-sm text-gray-300 transition-colors"
          >
            <Truck className="text-gray-400 text-[20px]" />
            <span>Shipments</span>
          </Link>
          <Link
            href="/invoices"
            className="flex items-center space-x-3 hover:bg-[#2d4a35]/50 px-5 py-3 rounded-full text-sm text-gray-300 transition-colors"
          >
            <Receipt className="text-gray-400 text-[20px]" />
            <span>Invoices</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f9fafb]">
        {/* Header & Progress Tracker */}
        <header className="bg-[#1a3020] text-white p-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-10">
              Client Sourcing Dashboard
            </h2>

            {/* Progress Steps */}
            <div className="relative flex justify-between items-center max-w-4xl mx-auto">
              {/* Connector Lines */}
              <div className="absolute top-4 left-0 right-0 -translate-y-1/2 flex items-center">
                <div className="w-full h-1 bg-gray-500 rounded-full"></div>
                <div
                  className="absolute h-1 bg-[#4ade80] rounded-full"
                  style={{ width: '66%' }}
                ></div>
              </div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <Check className="text-white text-[18px] font-bold" />
                </div>
                <span className="text-xs font-medium">1. Submit Request</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <Check className="text-white text-[18px] font-bold" />
                </div>
                <span className="text-xs font-medium">2. Sourcing</span>
              </div>

              {/* Step 3 (Active) */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 bg-[#f0ad4e] rounded-full flex items-center justify-center mb-2 shadow-[0_0_0_4px_#1a3020]">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-[#f0ad4e] italic">
                  3. Payment
                </span>
                <span className="text-[10px] text-[#f0ad4e]/80">
                  Payment Pending
                </span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mb-2"></div>
                <span className="text-xs font-medium text-gray-400">
                  4. Delivery
                </span>
                <span className="text-[10px] text-gray-500">Pending</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto -mt-8 px-8 pb-12 space-y-8">
          {/* Top Row: Active Quotes & Quick Shipment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Quotes Summary Table */}
            <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <h3 className="font-bold text-gray-800">
                  Active Quotes Summary
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        Request #5521 - Electronics Components
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        Quote Ready
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="#"
                          className="text-[#4ade80] font-bold hover:underline"
                        >
                          Review
                        </a>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        Request #5543 - Solar Panels
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        Sourcing in Progress
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="#"
                          className="text-[#4ade80] font-bold hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">
                        Request #5576 - Textile Machinery
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        Awaiting Supplier Response
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href="#"
                          className="text-[#4ade80] font-bold hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sidebar Summary Info */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
                Shipment Tracking Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-sm">Air Freight</span>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Tracking #AF9982</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Components</span>
                    <span>In Transit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-gray-800">
                      Oct 28, 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA:</span>
                    <span className="font-medium text-gray-800">
                      Nov 10, 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-800">Dubai</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Detailed Shipment Tracking */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg px-2">
              Shipment Tracking Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Air Freight Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <h4 className="font-bold text-gray-800 mb-4">Air Freight</h4>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <p>Tracking #AF9982</p>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Components</span>
                    <span className="text-gray-800 font-medium">
                      In Transit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-gray-800 font-medium">
                      Oct 28, 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ETA:</span>
                    <span className="text-gray-800 font-medium">
                      Nov 10, 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-800 font-medium">Dubai</span>
                  </div>
                </div>
              </div>

              {/* Sea Freight Card with Alert */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <h4 className="font-bold text-gray-800 mb-4">Sea Freight</h4>
                <div className="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                  <p>Tracking #SF7710</p>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-gray-800 font-medium">
                      Arrived at Port
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ETA:</span>
                    <span className="text-gray-800 font-medium">
                      Nov 10, 2023
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-800 font-medium">Mombasa</span>
                  </div>
                </div>
                {/* Alert Banner */}
                <div className="bg-[#f0ad4e]/10 border border-[#f0ad4e]/30 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <AlertTriangle className="text-[#f0ad4e] text-[16px]" />
                  <span className="text-orange-800 text-[10px] font-bold tracking-wider uppercase">
                    Customs Action Required
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Pro-forma Invoices Horizontal List */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg px-2">
              Recent Pro-forma Invoices
            </h3>
            <div className="relative group">
              {/* Scroll Navigation Button */}
              <button
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft className="text-gray-400 text-[20px]" />
              </button>

              <div
                className="flex space-x-6 overflow-x-auto pb-4 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Invoice Card 1 (Pending) */}
                <div className="min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800">
                      Invoice #INV-1045
                    </h4>
                    <p className="text-xs text-gray-500">
                      Amount:{' '}
                      <span className="text-gray-800 font-bold">$12,500</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Due Date:{' '}
                      <span className="text-gray-800 font-medium">
                        Oct 25, 2023
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{' '}
                      <span className="text-[#f0ad4e] font-bold">PENDING</span>
                    </p>
                  </div>
                  <button className="w-full bg-[#f0ad4e] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-500 transition-colors shadow-sm">
                    Pay Now
                  </button>
                </div>

                {/* Invoice Card 2 (Paid) */}
                <div className="min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800">
                      Invoice #INV-1038
                    </h4>
                    <p className="text-xs text-gray-500">
                      Amount:{' '}
                      <span className="text-gray-800 font-bold">$5,200</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Due Date:{' '}
                      <span className="text-gray-800 font-medium">
                        Oct 20, 2023
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{' '}
                      <span className="text-[#1a3020] font-bold uppercase">
                        PAID
                      </span>
                    </p>
                  </div>
                  <button className="w-full bg-[#1a3020] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#2d4a35] transition-colors">
                    View Receipt
                  </button>
                </div>

                {/* Invoice Card 3 (Paid) */}
                <div className="min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800">
                      Invoice #INV-1039
                    </h4>
                    <p className="text-xs text-gray-500">
                      Amount:{' '}
                      <span className="text-gray-800 font-bold">$8,900</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Due Date:{' '}
                      <span className="text-gray-800 font-medium">
                        Oct 15, 2023
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{' '}
                      <span className="text-[#1a3020] font-bold uppercase">
                        PAID
                      </span>
                    </p>
                  </div>
                  <button className="w-full bg-[#1a3020] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#2d4a35] transition-colors">
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
