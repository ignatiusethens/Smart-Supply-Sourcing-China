'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api/auth-client';
import {
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Wallet,
  FolderOpen,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface FinancialMetrics {
  totalRevenue: number;
  pendingPayments: number;
  netProfit: number;
  mpesaVerifiedPercent: number;
  revenueGrowth: number;
  pendingCount: number;
  profitMargin: number;
  mpesaTransfers: number;
}

interface Transaction {
  id: string;
  date: string;
  transactionId: string;
  description: string;
  supplier: string;
  method: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

export default function FinancialsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 4285000,
    pendingPayments: 842500,
    netProfit: 942700,
    mpesaVerifiedPercent: 98.4,
    revenueGrowth: 12.4,
    pendingCount: 24,
    profitMargin: 22,
    mpesaTransfers: 1240,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchFinancialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      // Fetch orders and payments data
      const ordersResponse = await authFetch('/api/orders?admin=true');
      const ordersData = await ordersResponse.json();

      if (ordersData.success) {
        const orders = ordersData.data?.data || ordersData.data || [];
        
        // Calculate metrics from real data
        const totalRevenue = orders.reduce((sum: number, order: { totalAmount?: string | number }) => 
          sum + parseFloat(String(order.totalAmount || 0)), 0
        );
        
        const pendingPayments = orders
          .filter((order: { paymentStatus?: string }) => 
            order.paymentStatus === 'pending' || 
            order.paymentStatus === 'pending-reconciliation'
          )
          .reduce((sum: number, order: { totalAmount?: string | number }) => sum + parseFloat(String(order.totalAmount || 0)), 0);

        const completedOrders = orders.filter((order: { paymentStatus?: string }) => 
          order.paymentStatus === 'completed' || order.paymentStatus === 'reconciled'
        );

        setMetrics({
          totalRevenue,
          pendingPayments,
          netProfit: totalRevenue * 0.22, // 22% margin
          mpesaVerifiedPercent: 98.4,
          revenueGrowth: 12.4,
          pendingCount: orders.filter((o: { paymentStatus?: string }) => 
            o.paymentStatus === 'pending' || o.paymentStatus === 'pending-reconciliation'
          ).length,
          profitMargin: 22,
          mpesaTransfers: completedOrders.length,
        });

        // Transform orders to transactions
        const transactionsList: Transaction[] = orders.map((order: {
          id: string;
          createdAt: string;
          referenceCode: string;
          buyer?: { name?: string };
          paymentMethod?: string;
          totalAmount?: string | number;
          paymentStatus?: string;
        }) => ({
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          transactionId: order.referenceCode,
          description: `Order ${order.referenceCode}`,
          supplier: order.buyer?.name || 'Unknown',
          method: order.paymentMethod === 'mpesa' ? 'M-Pesa Business' : 'Wire Transfer',
          amount: parseFloat(String(order.totalAmount || 0)),
          status: order.paymentStatus === 'completed' || order.paymentStatus === 'reconciled' 
            ? 'success' 
            : order.paymentStatus === 'failed' 
            ? 'failed' 
            : 'pending',
        }));

        setTransactions(transactionsList);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-[#f9faf6]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-emerald-900 border-r border-emerald-800 shadow-xl z-50 flex flex-col">
        <div className="px-6 py-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fe7a34] rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black tracking-widest uppercase text-sm">
                Smart Supply Sourcing China
              </h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <a
            href="/admin/dashboard"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-3 my-1 hover:bg-emerald-800/50 transition-all duration-200 cursor-pointer text-sm font-medium rounded-md"
          >
            <Package className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a
            href="/admin/sourcing"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-3 my-1 hover:bg-emerald-800/50 transition-all duration-200 cursor-pointer text-sm font-medium rounded-md"
          >
            <FileText className="w-5 h-5 mr-3" />
            Requests
          </a>
          <a
            href="/admin/orders"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-3 my-1 hover:bg-emerald-800/50 transition-all duration-200 cursor-pointer text-sm font-medium rounded-md"
          >
            <ShoppingCart className="w-5 h-5 mr-3" />
            Orders
          </a>
          <a
            href="/admin/users"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-3 my-1 hover:bg-emerald-800/50 transition-all duration-200 cursor-pointer text-sm font-medium rounded-md"
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </a>
          <a
            href="/admin/financials"
            className="bg-emerald-800 text-white rounded-md border-l-4 border-orange-500 flex items-center px-4 py-3 my-1 text-sm font-medium"
          >
            <Wallet className="w-5 h-5 mr-3" />
            Financials
          </a>
          <a
            href="/admin/catalog"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-3 my-1 hover:bg-emerald-800/50 transition-all duration-200 cursor-pointer text-sm font-medium rounded-md"
          >
            <FolderOpen className="w-5 h-5 mr-3" />
            Content Inventory
          </a>
        </nav>

        <div className="px-3 border-t border-emerald-800 py-6 space-y-1 flex-shrink-0 bg-emerald-900">
          <a
            href="/admin/settings"
            className="text-emerald-100/70 hover:text-white flex items-center px-4 py-2 hover:bg-emerald-800/50 transition-all duration-200 text-sm font-medium rounded-md"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </a>
          <button
            onClick={handleLogout}
            className="w-full text-emerald-100/70 hover:text-white flex items-center px-4 py-2 hover:bg-emerald-800/50 transition-all duration-200 text-sm font-medium rounded-md"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex-1">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">
              Financials & Invoicing
            </h1>
            <div className="max-w-md w-full ml-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transactions, invoices, or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#f3f4f1] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#012d1d] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-emerald-950 leading-none">Admin User</p>
                <p className="text-xs text-gray-500 leading-none mt-1">SinoSource Global</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#a5d0b9] border-2 border-[#c1ecd4] flex items-center justify-center text-[#012d1d] font-bold text-sm">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Financial Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-xl border border-[#c1c8c2] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#c1ecd4]/30 rounded-lg">
                  <Wallet className="w-6 h-6 text-[#012d1d]" />
                </div>
                <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{metrics.revenueGrowth}%
                </span>
              </div>
              <p className="text-[#414844] text-sm font-medium">Total Revenue (YTD)</p>
              <h3 className="text-2xl font-bold text-[#012d1d] mt-1">
                {formatCurrency(metrics.totalRevenue)}
              </h3>
              <p className="text-xs text-[#717973] mt-2">Target: $5.0M</p>
              <div className="w-full bg-[#eeeeeb] mt-2 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#012d1d] h-full"
                  style={{ width: `${(metrics.totalRevenue / 5000000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-white p-6 rounded-xl border border-[#c1c8c2] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-[#a14000]" />
                </div>
                <span className="text-[#a14000] text-xs font-bold flex items-center bg-orange-50 px-2 py-1 rounded-full">
                  {metrics.pendingCount} Active
                </span>
              </div>
              <p className="text-[#414844] text-sm font-medium">Pending Payments</p>
              <h3 className="text-2xl font-bold text-[#a14000] mt-1">
                {formatCurrency(metrics.pendingPayments)}
              </h3>
              <p className="text-xs text-[#717973] mt-2">Avg. Collection: 14 Days</p>
              <div className="w-full bg-[#eeeeeb] mt-2 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#a14000] h-full w-[45%]"></div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white p-6 rounded-xl border border-[#c1c8c2] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#c1ecd4]/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-[#012d1d]" />
                </div>
                <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-full">
                  {metrics.profitMargin}% Margin
                </span>
              </div>
              <p className="text-[#414844] text-sm font-medium">Net Profit (YTD)</p>
              <h3 className="text-2xl font-bold text-[#012d1d] mt-1">
                {formatCurrency(metrics.netProfit)}
              </h3>
              <p className="text-xs text-[#717973] mt-2">Net growth from Q3</p>
              <div className="w-full bg-[#eeeeeb] mt-2 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#012d1d] h-full w-[62%]"></div>
              </div>
            </div>

            {/* M-Pesa Verified */}
            <div className="bg-white p-6 rounded-xl border border-[#c1c8c2] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-[#a14000]" />
                </div>
                <span className="text-[#a14000] text-xs font-bold flex items-center bg-orange-50 px-2 py-1 rounded-full">
                  High Trust
                </span>
              </div>
              <p className="text-[#414844] text-sm font-medium">M-Pesa Verified %</p>
              <h3 className="text-2xl font-bold text-[#a14000] mt-1">
                {metrics.mpesaVerifiedPercent}%
              </h3>
              <p className="text-xs text-[#717973] mt-2">
                {metrics.mpesaTransfers} Successful Transfers
              </p>
              <div className="w-full bg-[#eeeeeb] mt-2 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#a14000] h-full"
                  style={{ width: `${metrics.mpesaVerifiedPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="bg-white rounded-xl border border-[#c1c8c2] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#c1c8c2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-lg font-bold text-emerald-950">Transaction Ledger</h4>
                <p className="text-sm text-[#717973]">
                  Real-time procurement and logistics cashflow
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#e8e8e5] rounded-lg text-sm font-semibold text-[#1a1c1a] hover:bg-[#e2e3e0] transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#012d1d] text-white rounded-lg text-sm font-semibold hover:bg-[#1b4332] transition-colors shadow-lg">
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f3f4f1]">
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Supplier/Client
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-[#717973] uppercase tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c1c8c2]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-[#012d1d]" />
                          <span className="ml-3 text-gray-500">Loading transactions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-[#f9faf6] transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1a1c1a]">
                          {txn.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#717973]">
                          {txn.transactionId}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#414844] font-medium">
                          {txn.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#c1ecd4] flex items-center justify-center text-[10px] font-bold text-[#012d1d]">
                              {getInitials(txn.supplier)}
                            </div>
                            <span className="text-sm font-semibold text-[#1a1c1a]">
                              {txn.supplier}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#717973]">
                          {txn.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#012d1d]">
                          {formatCurrency(txn.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(
                              txn.status
                            )}`}
                          >
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && filteredTransactions.length > 0 && (
              <div className="px-6 py-4 bg-[#f3f4f1] flex items-center justify-between">
                <p className="text-xs font-medium text-[#717973]">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{' '}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-[#e8e8e5] text-[#717973] disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-xs font-bold ${
                        currentPage === page
                          ? 'bg-[#012d1d] text-white'
                          : 'hover:bg-[#e8e8e5] text-[#1a1c1a]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-[#e8e8e5] text-[#717973] disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
