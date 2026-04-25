'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Package,
  ShoppingBag,
  LogOut,
  FileText,
  Users,
  DollarSign,
} from 'lucide-react';
import { authFetch } from '@/lib/api/auth-client';
import { useAuthStore } from '@/lib/stores/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/sourcing', label: 'Sourcing Requests', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/financials', label: 'Financials', icon: DollarSign },
  { href: '/admin/ledger', label: 'Quotes & Ledger', icon: BookOpen },
  { href: '/admin/catalog', label: 'Catalog', icon: ShoppingBag },
  { href: '/admin/inventory', label: 'Inventory', icon: Package },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    logout();
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 bg-[#153e2a] flex flex-col"
        aria-label="Admin navigation sidebar"
      >
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-[#1a4d32]">
          <span className="text-white font-bold text-lg tracking-tight">
            Smart Supply
          </span>
          <p className="text-emerald-200 text-xs mt-0.5">Admin Portal</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin menu">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-100 hover:bg-[#1a4d32] hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#1a4d32]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-100 hover:bg-[#1a4d32] hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
