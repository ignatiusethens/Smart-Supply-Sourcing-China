'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PieChart, FileText, Truck, Receipt } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: PieChart },
    { href: '/sourcing', label: 'Requests', icon: FileText },
    { href: '/shipments', label: 'Shipments', icon: Truck },
    { href: '/invoices', label: 'Invoices', icon: Receipt },
  ];

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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-5 py-3 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2d4a35] text-white'
                    : 'hover:bg-[#2d4a35]/50 text-gray-300'
                }`}
              >
                <Icon
                  className={`text-[20px] ${isActive ? 'text-white' : 'text-gray-400'}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#f9fafb]">
        {children}
      </main>
    </div>
  );
}
