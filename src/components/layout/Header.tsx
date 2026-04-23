'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cartStore';
import { ShoppingCart, Menu, X, Bell, Search, User } from 'lucide-react';
import { useAnnouncer } from '@/lib/hooks/useAccessibility';
import { useAuthStore } from '@/lib/stores/authStore';

interface HeaderProps {
  userRole?: 'buyer' | 'admin';
}

export function Header({ userRole = 'buyer' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const cartItems = useCartStore((state) => state.totalItems);
  const { announce } = useAnnouncer();
  const { isAuthenticated, user } = useAuthStore();

  const buyerLinks = [
    {
      href: '/catalog',
      label: 'Services',
      description: 'Our services',
    },
    {
      href: '/catalog',
      label: 'Inventory',
      description: 'Browse product inventory',
    },
    {
      href: '/#how-it-works',
      label: 'How It Works',
      description: 'How our process works',
    },
    {
      href: '/#payments',
      label: 'Payments',
      description: 'Payment options',
    },
    {
      href: '/',
      label: 'Support',
      description: 'Get support',
    },
  ];

  const adminLinks = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      description: 'Admin dashboard',
    },
    { href: '/admin/orders', label: 'Orders', description: 'Manage orders' },
    {
      href: '/admin/ledger',
      label: 'Ledger',
      description: 'Payment reconciliation',
    },
    {
      href: '/admin/sourcing',
      label: 'Sourcing',
      description: 'Manage sourcing requests',
    },
  ];

  const links = userRole === 'admin' ? adminLinks : buyerLinks;

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    announce(`Navigation menu ${newState ? 'opened' : 'closed'}`, 'polite');
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
      className="sticky top-0 z-50 w-full bg-white border-b border-primary-200 shadow-sm"
      role="banner"
    >
      {/* Skip navigation link for accessibility */}
      <a
        href="#main-content"
        className="skip-nav"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      <div className="container mx-auto h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Smart Supply Sourcing - Go to homepage"
        >
          <Image
            src="/logo.png"
            alt="Smart Supply Sourcing logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="hidden sm:inline text-[#1a6b50] font-bold text-base md:text-lg whitespace-nowrap">
            Smart Supply Sourcing
          </span>
        </Link>

        {/* Desktop Navigation — center */}
        {userRole === 'buyer' && (
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
            role="navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-[#1a6b50] font-medium text-sm transition-colors duration-200 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
                aria-label={link.description}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Admin Desktop Navigation */}
        {userRole === 'admin' && (
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Admin navigation"
            role="navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-gray-600 hover:text-[#1a6b50] font-medium text-sm rounded-md hover:bg-[#e8f4f0] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
                aria-label={link.description}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Search bar — center (buyer only, desktop) */}
        {userRole === 'buyer' && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search products, orders, or quotes..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-primary-200 rounded-lg bg-primary-50 text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors duration-200"
                aria-label="Search products, orders, or quotes"
              />
            </div>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {userRole === 'buyer' && (
            <>
              {isAuthenticated ? (
                <>
                  {/* Cart icon */}
                  <Link
                    href="/cart"
                    aria-label={`Shopping cart with ${cartItems} item${cartItems === 1 ? '' : 's'}`}
                    className="relative inline-flex items-center justify-center h-10 w-10 rounded-md text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                    {cartItems > 0 && (
                      <>
                        <span
                          className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                          aria-hidden="true"
                        >
                          {cartItems > 99 ? '99+' : cartItems}
                        </span>
                        <span className="sr-only">
                          {cartItems} item{cartItems === 1 ? '' : 's'} in cart
                        </span>
                      </>
                    )}
                  </Link>

                  {/* Bell / notifications icon */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-md text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* User avatar */}
                  <Link
                    href={
                      user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'
                    }
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    aria-label="Go to account dashboard"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  {/* Browse Catalog — outlined */}
                  <Link
                    href="/catalog"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#1a6b50] border border-[#1a6b50] rounded-lg hover:bg-[#e8f4f0] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
                  >
                    Browse Catalog
                  </Link>

                  {/* Create Free Account — filled */}
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#1a6b50] rounded-lg hover:bg-[#155a42] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-600 hover:text-[#1a6b50] hover:bg-[#e8f4f0] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
            onClick={handleMobileMenuToggle}
            onKeyDown={handleKeyDown}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={
              mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        id="mobile-menu"
        className={`md:hidden border-t border-primary-200 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-label="Mobile navigation"
        role="navigation"
        aria-hidden={!mobileMenuOpen}
        onKeyDown={handleKeyDown}
      >
        <div className="container mx-auto py-4 space-y-1">
          <div className="sr-only" aria-live="polite">
            {mobileMenuOpen
              ? 'Mobile navigation menu opened. Press Escape to close.'
              : ''}
          </div>

          {/* Mobile search */}
          {userRole === 'buyer' && (
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search products, orders, or quotes..."
                className="w-full pl-9 pr-4 py-3 text-sm border border-primary-200 rounded-lg bg-primary-50 text-primary-800 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors duration-200"
                aria-label="Search products, orders, or quotes"
              />
            </div>
          )}

          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleMobileMenuClose}
              className="flex items-center w-full px-3 py-3 text-gray-600 hover:text-[#1a6b50] hover:bg-[#e8f4f0] font-medium text-base rounded-md transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a6b50]"
              aria-label={link.description}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
