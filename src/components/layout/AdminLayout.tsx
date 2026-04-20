'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="admin" />
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar - hidden on mobile, visible on tablet and desktop */}
        <aside 
          className="hidden md:block w-64 lg:w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto"
          aria-label="Admin navigation sidebar"
        >
          <nav className="p-4 sm:p-5 md:p-6 space-y-2" aria-label="Admin menu">
            {/* Sidebar navigation will be added here */}
          </nav>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 w-full overflow-y-auto" tabIndex={-1}>
          <div className="container mx-auto py-6 sm:py-8 md:py-10 lg:py-12">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}