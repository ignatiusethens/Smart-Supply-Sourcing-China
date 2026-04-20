'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useAnnouncer } from '@/lib/hooks/useAccessibility';

interface HeaderProps {
  userRole?: 'buyer' | 'admin';
}

export function Header({ userRole = 'buyer' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const cartItems = useCartStore((state) => state.totalItems);
  const { announce } = useAnnouncer();

  const buyerLinks = [
    { href: '/catalog', label: 'Catalog', description: 'Browse product catalog' },
    { href: '/orders', label: 'Orders', description: 'View your orders' },
    { href: '/dashboard', label: 'Dashboard', description: 'Account dashboard' },
    { href: '/sourcing/request', label: 'Sourcing', description: 'Request custom sourcing' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', description: 'Admin dashboard' },
    { href: '/admin/orders', label: 'Orders', description: 'Manage orders' },
    { href: '/admin/ledger', label: 'Ledger', description: 'Payment reconciliation' },
    { href: '/admin/sourcing', label: 'Sourcing', description: 'Manage sourcing requests' },
  ];

  const links = userRole === 'admin' ? adminLinks : buyerLinks;

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    announce(
      `Navigation menu ${newState ? 'opened' : 'closed'}`,
      'polite'
    );
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    announce('Navigation menu closed', 'polite');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      handleMobileMenuClose();
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
      role="banner"
    >
      <div className="container mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-2 font-bold text-lg focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex-shrink-0"
          aria-label="Smart Supply Sourcing - Go to homepage"
        >
          <div 
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            aria-hidden="true"
          >
            SSS
          </div>
          <span className="hidden sm:inline text-base md:text-lg">Smart Supply</span>
        </Link>

        {/* Desktop Navigation */}
        <nav 
          className="hidden md:flex items-center gap-1" 
          aria-label="Main navigation"
          role="navigation"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button 
                variant="ghost" 
                size="sm"
                className="focus-visible:rounded-md text-sm lg:text-base"
                aria-label={link.description}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userRole === 'buyer' && (
            <Link 
              href="/cart" 
              aria-label={`Shopping cart with ${cartItems} item${cartItems === 1 ? '' : 's'}`}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative focus-visible:rounded-md h-10 w-10 sm:h-11 sm:w-11"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                {cartItems > 0 && (
                  <>
                    <span 
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      aria-hidden="true"
                    >
                      {cartItems > 99 ? '99+' : cartItems}
                    </span>
                    <span className="sr-only">
                      {cartItems} item{cartItems === 1 ? '' : 's'} in cart
                    </span>
                  </>
                )}
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden focus-visible:rounded-md h-10 w-10 sm:h-11 sm:w-11"
            onClick={handleMobileMenuToggle}
            onKeyDown={handleKeyDown}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-[calc(100vh-4rem)] overflow-y-auto"
          aria-label="Mobile navigation"
          role="navigation"
          onKeyDown={handleKeyDown}
        >
          <div className="container mx-auto py-4 space-y-2">
            <div className="sr-only" aria-live="polite">
              Mobile navigation menu opened. Press Escape to close.
            </div>
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleMobileMenuClose}
              >
                <Button 
                  variant="ghost" 
                  className="w-full justify-start focus-visible:rounded-md h-12 text-base"
                  aria-label={link.description}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}