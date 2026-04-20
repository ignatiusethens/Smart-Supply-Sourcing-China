'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="buyer" />
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        <div className="container mx-auto py-6 sm:py-8 md:py-10 lg:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}