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
  Settings,
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

type DashboardTab = 'overview' | 'orders' | 'invoices' | 'settings';

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

function SidebarNav() {
  const router = useRouter();

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: false,
    },
    { label: 'My Orders', href: '/orders', icon: ShoppingBag, active: false },
    { label: 'Invoices', href: '/dashboard', icon: FileText, active: true },
    { label: 'Settings', href: '/dashboard', icon: Settings, active: false },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <aside
      className="w-52 flex-shrink-0 bg-white border-r border-primary-200 flex flex-col min-h-screen"
      aria-label="Buyer navigation"
    >
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-primary-100">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Smart Supply Sourcing"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-bold text-primary-800">
            Smart Supply
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-primary-600 hover:bg-primary-50 hover:text-primary-800'
              }`}
              aria-current={item.active ? 'page' : undefined}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-blue-600' : 'text-primary-400'}`}
                aria-hidden="true"
              />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut
            className="w-4 h-4 flex-shrink-0 text-primary-400"
            aria-hidden="true"
          />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  title,
  amount,
  icon: Icon,
  bgColor,
  iconBg,
}: {
  title: string;
  amount: number;
  icon: React.ElementType;
  bgColor: string;
  iconBg?: string;
}) {
  return (
    <div
      className={`${bgColor} border border-primary-200 rounded-xl p-6 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-primary-900">
            {formatCurrency(amount)}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg ${iconBg ?? 'bg-white/50'} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'awaiting-bank-transfer': {
      label: 'Awaiting Bank Transfer',
      className: 'bg-blue-100 text-blue-800 border border-blue-300',
    },
    'pending-reconciliation': {
      label: 'Pending Reconciliation',
      className: 'bg-amber-100 text-amber-800 border border-amber-300',
    },
    paid: {
      label: 'Paid',
      className: 'bg-green-100 text-green-800 border border-green-300',
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

// ─── Payment table row ────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  return (
    <tr className="border-b border-primary-100 hover:bg-primary-50 transition-colors">
      <td className="px-4 py-4">
        <p className="text-sm font-bold text-primary-800 font-mono">
          {payment.invoiceId}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-primary-800">
          {payment.orderId}
        </p>
        <p className="text-xs text-primary-500 mt-0.5">
          Issued: {formatDate(payment.issuedDate)}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-bold text-primary-900">
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
              <span className="text-sm text-primary-700">M-Pesa</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">B</span>
              </div>
              <span className="text-sm text-primary-700">Bank Transfer</span>
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
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5">
              <Upload className="w-3 h-3" aria-hidden="true" />
              Upload Proof
            </button>
          )}
          {payment.status === 'pending-reconciliation' && (
            <button className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors">
              Instructions
            </button>
          )}
          <button
            className="p-1.5 text-primary-500 hover:text-primary-700 transition-colors"
            aria-label="Download invoice"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            className="p-1.5 text-primary-500 hover:text-primary-700 transition-colors"
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
  const [activeTab, setActiveTab] = useState<DashboardTab>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Calculate total paid MTD (sum of paid payments)
  const totalPaidMTD = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard summary
        const summaryResponse = await authFetch(
          `/api/orders/dashboard/summary`
        );
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch dashboard summary');
        }

        const summaryData = await summaryResponse.json();
        if (summaryData.success && summaryData.data) {
          setDashboardData(summaryData.data);
        }

        // Fetch payment history
        const paymentsResponse = await authFetch(
          `/api/orders/dashboard/payments?page=1&limit=10`
        );
        if (!paymentsResponse.ok) {
          throw new Error('Failed to fetch payment history');
        }

        const paymentsData = await paymentsResponse.json();
        if (paymentsData.success && paymentsData.data) {
          setPayments(paymentsData.data.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Tab config
  const tabs: { key: DashboardTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'settings', label: 'Settings' },
  ];

  // Filtered payments by search query
  const filteredPayments = searchQuery.trim()
    ? payments.filter(
        (p) =>
          p.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  // Pagination
  const itemsPerPage = 5;
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex min-h-screen bg-primary-50">
        <SidebarNav />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-primary-200 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex min-h-screen bg-primary-50">
      {/* Left sidebar */}
      <SidebarNav />

      {/* Main content */}
      <main
        className="flex-1 px-8 py-8 overflow-y-auto"
        id="main-content"
        tabIndex={-1}
      >
        {/* Page header + action buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">
              Account Dashboard
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              Manage your sourcing orders, payments, and account preferences.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg bg-white hover:bg-primary-50 transition-colors">
              <Download className="w-4 h-4" aria-hidden="true" />
              Export Ledger
            </button>
            <Link href="/sourcing/request">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Sourcing Request
              </button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tab bar */}
        <div
          className="flex gap-0 border-b border-primary-200 mb-6 mt-6"
          role="tablist"
          aria-label="Dashboard tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-primary-500 hover:text-primary-800 hover:border-primary-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview tab ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && dashboardData && (
          <DashboardSummary
            outstandingBalance={dashboardData.outstandingBalance}
            pendingReconciliation={dashboardData.pendingReconciliation}
            totalOrders={dashboardData.totalOrders}
            completedOrders={dashboardData.completedOrders}
          />
        )}

        {/* ── Orders tab ───────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-primary-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-primary-900 mb-4">
              Recent Orders
            </h2>
            <p className="text-sm text-primary-500">
              View your full order history on the{' '}
              <Link
                href="/orders"
                className="text-blue-600 hover:underline font-medium"
              >
                Orders page
              </Link>
              .
            </p>
          </div>
        )}

        {/* ── Invoices tab (default) ────────────────────────────────────────── */}
        {activeTab === 'invoices' && (
          <>
            {/* KPI Cards */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPICard
                  title="Outstanding Balance"
                  amount={dashboardData.outstandingBalance}
                  icon={FileText}
                  bgColor="bg-blue-50"
                  iconBg="bg-white"
                />
                <KPICard
                  title="Pending Reconciliation"
                  amount={dashboardData.pendingReconciliation}
                  icon={Clock}
                  bgColor="bg-white"
                  iconBg="bg-primary-50"
                />
                <KPICard
                  title="Total Paid (MTD)"
                  amount={totalPaidMTD}
                  icon={CheckCircle2}
                  bgColor="bg-white"
                  iconBg="bg-primary-50"
                />
              </div>
            )}

            {/* Payment History Section */}
            <div className="bg-white border border-primary-200 rounded-xl shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="px-6 py-4 border-b border-primary-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-primary-900">
                      Payment History
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Info
                        className="w-3.5 h-3.5 text-primary-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-xs text-primary-500">
                        Bank transfers take 1-3 business days to clear
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        placeholder="Filter by Order ID..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 pr-4 py-2 text-sm border border-primary-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-primary-800 placeholder:text-primary-400"
                        aria-label="Filter payments by Order ID"
                      />
                    </div>
                    <button
                      className="p-2 text-primary-500 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                      aria-label="Advanced filter"
                    >
                      <Filter className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50 border-b border-primary-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Invoice ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Order Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Payment Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <FileText
                            className="w-12 h-12 text-primary-300 mx-auto mb-4"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-primary-500">
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

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="px-6 py-4 border-t border-primary-100 flex items-center justify-between">
                  <p className="text-sm text-primary-600">
                    Showing {Math.min(startIndex + 1, totalItems)}-
                    {Math.min(endIndex, totalItems)} of {totalItems} invoices
                  </p>
                  <nav
                    className="flex items-center gap-2"
                    aria-label="Payment history pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: Math.min(3, totalPages) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-primary-700 border border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Settings tab ─────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-primary-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-primary-900 mb-4">
              Account Settings
            </h2>
            <p className="text-sm text-primary-500">
              Manage your account preferences and notification settings.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
