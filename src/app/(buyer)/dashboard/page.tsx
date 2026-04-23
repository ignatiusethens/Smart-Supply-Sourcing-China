'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { authFetch } from '@/lib/api/auth-client';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  LogOut,
  Search,
  Filter,
  Download,
  MoreVertical,
  Upload,
  Clock,
  CheckCircle2,
  Plus,
  Info,
  Package,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { DashboardSummary } from '@/components/buyer/DashboardSummary';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  outstandingBalance: number;
  pendingReconciliation: number;
  totalOrders: number;
  completedOrders: number;
}

interface PaymentRecord {
  id: string;
  invoiceId: string;
  orderId: string;
  amount: number;
  paymentMethod: 'bank-transfer' | 'mpesa';
  status: 'awaiting-bank-transfer' | 'pending-reconciliation' | 'paid';
  issuedDate: string;
  createdAt: string;
}

type DashboardTab = 'overview' | 'orders' | 'invoices';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}) {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const navItems: {
    label: string;
    tab: DashboardTab;
    icon: React.ElementType;
  }[] = [
    { label: 'Overview', tab: 'overview', icon: LayoutDashboard },
    { label: 'My Orders', tab: 'orders', icon: ShoppingBag },
    { label: 'Invoices', tab: 'invoices', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside
      className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen"
      aria-label="Buyer navigation"
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Smart Supply Sourcing China"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-bold text-gray-800">Smart Supply</span>
        </Link>
      </div>

      {/* User greeting */}
      {user?.name && (
        <div className="px-5 py-3 border-b border-gray-100 bg-[#f0faf6]">
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm font-bold text-[#1a6b50] truncate">
            {user.name}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#e8f4f0] text-[#1a6b50] border border-[#b2d8cc]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#1a6b50]' : 'text-gray-400'}`}
                aria-hidden="true"
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut
            className="w-4 h-4 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'awaiting-bank-transfer': {
      label: 'Awaiting Bank Transfer',
      className: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    'pending-reconciliation': {
      label: 'Pending Reconciliation',
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    paid: {
      label: 'Paid',
      className: 'bg-green-50 text-green-700 border border-green-200',
    },
  };
  const { label, className } =
    config[status] ?? config['awaiting-bank-transfer'];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

// ─── Payment row ──────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-[#f0faf6] transition-colors">
      <td className="px-4 py-4">
        <p className="text-sm font-bold text-gray-800 font-mono">
          {payment.invoiceId}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-800">{payment.orderId}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Issued: {formatDate(payment.issuedDate)}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-bold text-[#1a6b50]">
          {formatCurrency(payment.amount)}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {payment.paymentMethod === 'mpesa' ? (
            <>
              <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">M</span>
              </div>
              <span className="text-sm text-gray-700">M-Pesa</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">B</span>
              </div>
              <span className="text-sm text-gray-700">Bank Transfer</span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {payment.status === 'awaiting-bank-transfer' && (
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1a6b50] hover:bg-[#155a42] rounded-lg transition-colors flex items-center gap-1.5">
              <Upload className="w-3 h-3" aria-hidden="true" />
              Upload Proof
            </button>
          )}
          <button
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Download invoice"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const totalPaidMTD = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const summaryRes = await authFetch('/api/orders/dashboard/summary');
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.success) setDashboardData(summaryData.data);
        }
        const paymentsRes = await authFetch(
          '/api/orders/dashboard/payments?page=1&limit=10'
        );
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          if (paymentsData.success) setPayments(paymentsData.data.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const filteredPayments = searchQuery.trim()
    ? payments.filter(
        (p) =>
          p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  const itemsPerPage = 5;
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f0faf6]">
        <div className="w-52 bg-white border-r border-gray-100 min-h-screen" />
        <main className="flex-1 p-8 animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0faf6]">
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-8 py-8 overflow-y-auto" id="main-content">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Account Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your sourcing requests, payments, and invoices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" aria-hidden="true" />
              Export Ledger
            </button>
            <Link href="/sourcing/request">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a6b50] hover:bg-[#155a42] rounded-xl transition-colors">
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Sourcing Request
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {dashboardData ? (
              <DashboardSummary
                outstandingBalance={dashboardData.outstandingBalance}
                pendingReconciliation={dashboardData.pendingReconciliation}
                totalOrders={dashboardData.totalOrders}
                completedOrders={dashboardData.completedOrders}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: 'Outstanding Balance',
                    value: 'KES 0',
                    icon: '💳',
                    bg: 'bg-blue-50 border-blue-100',
                  },
                  {
                    label: 'Pending Reconciliation',
                    value: '0',
                    icon: '⏳',
                    bg: 'bg-amber-50 border-amber-100',
                  },
                  {
                    label: 'Total Orders',
                    value: '0',
                    icon: '📦',
                    bg: 'bg-[#e8f4f0] border-[#b2d8cc]',
                  },
                  {
                    label: 'Completed Orders',
                    value: '0',
                    icon: '✅',
                    bg: 'bg-green-50 border-green-100',
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-2xl border p-6 ${card.bg}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{card.icon}</span>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {card.label}
                      </p>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/sourcing/request"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 bg-[#e8f4f0] rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-[#1a6b50]" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">
                  New Sourcing Request
                </p>
                <p className="text-xs text-gray-500">
                  Submit a new procurement request to our team.
                </p>
              </Link>
              <Link
                href="/catalog"
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-10 h-10 bg-[#e8f4f0] rounded-xl flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-[#1a6b50]" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">
                  Browse Catalog
                </p>
                <p className="text-xs text-gray-500">
                  Shop in-stock products with instant M-Pesa payment.
                </p>
              </Link>
              <button
                onClick={() => setActiveTab('invoices')}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
              >
                <div className="w-10 h-10 bg-[#e8f4f0] rounded-xl flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-[#1a6b50]" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">
                  Payment History
                </p>
                <p className="text-xs text-gray-500">
                  View and download your invoices and receipts.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Explainer */}
            <div className="bg-[#e8f4f0] border border-[#b2d8cc] rounded-2xl p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#1a6b50] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1a6b50] mb-1">
                  How orders work
                </p>
                <p className="text-sm text-[#1a6b50] leading-relaxed">
                  An <span className="font-semibold">order</span> is created
                  once you complete payment — either via M-Pesa or bank
                  transfer. Submitting a sourcing request is the first step, but
                  it only becomes an order after payment is confirmed and
                  reconciled by our team.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">My Orders</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paid and confirmed orders appear here.
                </p>
              </div>
              {dashboardData && dashboardData.totalOrders > 0 ? (
                <div className="p-6">
                  <Link
                    href="/orders"
                    className="text-sm font-semibold text-[#1a6b50] hover:underline"
                  >
                    View full order history →
                  </Link>
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <div className="w-14 h-14 bg-[#e8f4f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-7 h-7 text-[#1a6b50]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    No orders yet
                  </p>
                  <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
                    Once you pay for a sourcing quote or catalog item, your
                    order will appear here.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/sourcing/request"
                      className="inline-flex items-center gap-2 bg-[#1a6b50] hover:bg-[#155a42] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Submit Sourcing Request
                    </Link>
                    <Link
                      href="/catalog"
                      className="inline-flex items-center gap-2 border border-[#1a6b50] text-[#1a6b50] hover:bg-[#e8f4f0] text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Invoices ── */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#e8f4f0] border border-[#b2d8cc] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-bold text-[#1a6b50] uppercase tracking-wide">
                    Outstanding Balance
                  </p>
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#1a6b50]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {formatCurrency(dashboardData?.outstandingBalance ?? 0)}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Pending Reconciliation
                  </p>
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {formatCurrency(dashboardData?.pendingReconciliation ?? 0)}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Total Paid (MTD)
                  </p>
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {formatCurrency(totalPaidMTD)}
                </p>
              </div>
            </div>

            {/* Payment history table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Payment History
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-400">
                        Bank transfers take 1–3 business days to clear
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="search"
                        placeholder="Filter by Order ID..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-[#1a6b50] focus:ring-2 focus:ring-[#1a6b50]/20 placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label="Filter"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {[
                        'Invoice ID',
                        'Order Details',
                        'Amount',
                        'Payment Method',
                        'Status',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-16 text-center">
                          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">
                            No payment records found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentPayments.map((payment) => (
                        <PaymentRow key={payment.id} payment={payment} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalItems > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {Math.min(startIndex + 1, totalItems)}–
                    {Math.min(startIndex + itemsPerPage, totalItems)} of{' '}
                    {totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: Math.min(3, totalPages) },
                      (_, i) => i + 1
                    ).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg ${currentPage === p ? 'bg-[#1a6b50] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
