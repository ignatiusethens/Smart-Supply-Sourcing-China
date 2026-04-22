'use client';

import { useEffect, useState, useMemo } from 'react';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  Search,
  Filter,
  Upload,
  Headphones,
  MessageSquare,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabFilter = 'all' | 'unpaid' | 'processing' | 'completed';

// ─── Progress step config ─────────────────────────────────────────────────────

const PROGRESS_STEPS: { label: string; status: OrderStatus }[] = [
  { label: 'ORDER PLACED', status: 'pending-payment' },
  { label: 'PAYMENT', status: 'payment-received' },
  { label: 'PROCESSING', status: 'processing' },
  { label: 'SHIPPED', status: 'shipped' },
  { label: 'DELIVERED', status: 'completed' },
];

function getStepIndex(status: OrderStatus): number {
  const map: Record<OrderStatus, number> = {
    'pending-payment': 0,
    'payment-received': 1,
    processing: 2,
    shipped: 3,
    completed: 4,
    cancelled: -1,
  };
  return map[status] ?? 0;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    'pending-payment': {
      label: 'Pending Payment',
      className: 'bg-amber-100 text-amber-800 border border-amber-300',
    },
    'payment-received': {
      label: 'Payment Received',
      className: 'bg-blue-100 text-blue-800 border border-blue-300',
    },
    processing: {
      label: 'Processing',
      className: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-purple-100 text-purple-800 border border-purple-300',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border border-green-300',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 border border-red-300',
    },
  };

  const { label, className } = config[status] ?? config['pending-payment'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

// ─── 5-step horizontal progress tracker ──────────────────────────────────────

function TrackingProgress({ status }: { status: OrderStatus }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-3">
        Tracking Progress
      </p>
      <div className="flex items-center gap-0">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCompleted = !isCancelled && idx < currentStep;
          const isActive = !isCancelled && idx === currentStep;

          return (
            <div key={step.status} className="flex items-center flex-1 min-w-0">
              {/* Step circle + label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                        ? 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200'
                        : 'bg-white border-primary-300 text-primary-400'
                  }`}
                  aria-label={`Step ${idx + 1}: ${step.label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`mt-1 text-center leading-tight text-[9px] font-semibold uppercase tracking-wide max-w-[56px] ${
                    isCompleted || isActive
                      ? 'text-blue-700'
                      : 'text-primary-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {idx < PROGRESS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                    isCompleted ? 'bg-blue-600' : 'bg-primary-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Payment instructions box ─────────────────────────────────────────────────

function PaymentInstructionsBox({ order }: { order: Order }) {
  if (order.orderStatus !== 'pending-payment') return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
        Payment Instructions
      </p>
      <p className="text-sm text-blue-900">
        Please transfer exactly{' '}
        <span className="font-bold">{formatCurrency(order.totalAmount)}</span>{' '}
        to our Standard Chartered account using your Order ID{' '}
        <span className="font-bold font-mono">{order.referenceCode}</span> as
        the reference.
      </p>
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white border border-primary-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 px-6 py-4 border-b border-primary-100 bg-primary-50">
        <div>
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide">
            Order ID
          </p>
          <p className="text-sm font-bold text-primary-800 font-mono">
            {order.referenceCode}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide">
            Date Placed
          </p>
          <p className="text-sm text-primary-700">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide">
            Grand Total
          </p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        {/* Order items */}
        <div>
          <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-wide mb-2">
            Order Items
          </p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Thumbnail placeholder */}
                <div className="w-10 h-10 rounded-lg bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag
                    className="w-4 h-4 text-primary-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-primary-500">
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary-700 flex-shrink-0">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5-step progress tracker */}
        <TrackingProgress status={order.orderStatus} />

        {/* Payment instructions (pending payment only) */}
        <PaymentInstructionsBox order={order} />

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary-100">
          <Link href={`/orders/invoices/${order.id}`}>
            <button className="px-4 py-2 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              View Invoice
            </button>
          </Link>
          <Link href={`/orders/${order.id}`}>
            <button className="px-4 py-2 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
              Help
            </button>
          </Link>
          {order.orderStatus === 'pending-payment' && (
            <Link
              href={`/payment/bank-transfer?orderId=${order.id}`}
              className="ml-auto"
            >
              <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 flex items-center gap-2">
                <Upload className="w-4 h-4" aria-hidden="true" />
                Upload Proof of Payment
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

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
    { label: 'My Orders', href: '/orders', icon: ShoppingBag, active: true },
    { label: 'Invoices', href: '/dashboard', icon: FileText, active: false },
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
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">SS</span>
          </div>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';
        const response = await fetch(`/api/orders?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');

        const data = await response.json();
        if (data.success && data.data) {
          const list: Order[] = data.data.data ?? data.data ?? [];
          setOrders(list);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Tab filter
    if (selectedStatus === 'unpaid') {
      result = result.filter((o) => o.orderStatus === 'pending-payment');
    } else if (selectedStatus === 'processing') {
      result = result.filter((o) =>
        ['payment-received', 'processing'].includes(o.orderStatus)
      );
    } else if (selectedStatus === 'completed') {
      result = result.filter((o) => o.orderStatus === 'completed');
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.referenceCode.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [orders, selectedStatus, searchQuery]);

  // ── KPI counts ──────────────────────────────────────────────────────────────
  const pendingCount = orders.filter(
    (o) => o.orderStatus === 'pending-payment'
  ).length;
  const inProgressCount = orders.filter((o) =>
    ['payment-received', 'processing', 'shipped'].includes(o.orderStatus)
  ).length;

  // ── Tab config ──────────────────────────────────────────────────────────────
  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
  ];

  // ── Loading skeleton ────────────────────────────────────────────────────────
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

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen bg-primary-50">
        <SidebarNav />
        <main className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Error loading orders
            </h2>
            <p className="text-red-800">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
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
        {/* Page header + KPI badges */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">
              Order Tracking
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              Manage your active sourcing requests and track deliveries.
            </p>
          </div>

          {/* KPI badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-sm font-bold text-blue-800">
                {pendingCount} PENDING PAY
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle2
                className="w-4 h-4 text-green-600"
                aria-hidden="true"
              />
              <span className="text-sm font-bold text-green-800">
                {inProgressCount} IN PROGRESS
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-0 border-b border-primary-200 mb-6"
          role="tablist"
          aria-label="Order filters"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={selectedStatus === tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                selectedStatus === tab.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-primary-500 hover:text-primary-800 hover:border-primary-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by Order ID or Product Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-primary-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-primary-800 placeholder:text-primary-400"
              aria-label="Search orders"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg bg-white hover:bg-primary-50 transition-colors">
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filter by Date
          </button>
        </div>

        {/* Order cards list */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag
              className="w-12 h-12 text-primary-300 mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              No orders found
            </h3>
            <p className="text-primary-500 text-sm">
              {searchQuery
                ? 'Try adjusting your search query.'
                : selectedStatus !== 'all'
                  ? 'No orders match this filter.'
                  : "You haven't placed any orders yet."}
            </p>
            {selectedStatus === 'all' && !searchQuery && (
              <Link href="/catalog">
                <button className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Browse Catalog
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Orders">
            {filteredOrders.map((order) => (
              <div key={order.id} role="listitem">
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}

        {/* Help section */}
        <div className="mt-10 bg-white border border-primary-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-primary-900">
                Need Help with Sourcing?
              </h2>
              <p className="text-sm text-primary-500 mt-1">
                Our support team is available 24/7 to assist with your orders
                and sourcing requests.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sourcing/request">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors">
                  <Headphones className="w-4 h-4" aria-hidden="true" />
                  Open Help Desk
                </button>
              </Link>
              <Link href="/sourcing/request">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
