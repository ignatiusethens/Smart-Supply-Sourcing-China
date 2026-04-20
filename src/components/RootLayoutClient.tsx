'use client';

import { useSessionManagement } from '@/lib/hooks/useSessionManagement';
import { SessionWarningModal } from '@/components/shared/SessionWarningModal';
import { SkipNavigation } from '@/components/shared/SkipNavigation';
import { AccessibilityEnhancer } from '@/components/shared/AccessibilityEnhancer';
import { AccessibilityTester } from '@/components/shared/AccessibilityTester';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useSessionManagement();

  return (
    <AccessibilityEnhancer
      enableFocusManagement={true}
      enableKeyboardNavigation={true}
      enableColorContrastCheck={process.env.NODE_ENV === 'development'}
    >
      <SkipNavigation mainContentId="main-content" />
      {children}
      <SessionWarningModal />
      <AccessibilityTester />
    </AccessibilityEnhancer>
  );
}
