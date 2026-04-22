'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white mt-auto" role="contentinfo">
      <div className="container mx-auto py-10 sm:py-12 md:py-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 md:mb-12">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-white text-2xl font-bold leading-none select-none"
                aria-hidden="true"
              >
                ◇
              </span>
              <span className="text-white font-bold text-base">
                Smart Supply Sourcing
              </span>
            </div>
            <p className="text-primary-400 text-sm leading-relaxed">
              Your trusted B2B industrial equipment marketplace in Kenya.
            </p>
          </div>

          {/* Column 2: Sourcing */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-300 mb-4">
              Sourcing
            </h4>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <Link
                  href="/catalog"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/sourcing/request"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Bulk Sourcing
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Global Logistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Payment Methods */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-300 mb-4">
              Payment Methods
            </h4>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <span className="text-primary-400">M-Pesa Instant</span>
              </li>
              <li>
                <span className="text-primary-400">Bank Transfer 1–3 Days</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-primary-300 mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm" role="list">
              <li>
                <a
                  href="#"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="mailto:sales@smartsupply.co.ke"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Contact Sales
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-700 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-400 text-sm text-center sm:text-left">
            © {currentYear} Smart Supply Sourcing. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded text-sm"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-primary-400 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 rounded text-sm"
            >
              Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
