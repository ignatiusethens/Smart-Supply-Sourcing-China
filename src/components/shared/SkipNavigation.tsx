/**
 * Skip Navigation Component
 * Provides keyboard users with a way to skip to main content
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

'use client';

import React from 'react';

interface SkipNavigationProps {
  mainContentId?: string;
}

export function SkipNavigation({ mainContentId = 'main-content' }: SkipNavigationProps) {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${mainContentId}`}
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
