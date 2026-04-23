'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Session management hook — timeout disabled, sessions persist indefinitely.
 * Only tracks activity to keep lastActivityTime updated.
 */
export function useSessionManagement() {
  const { isAuthenticated, updateLastActivity } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => updateLastActivity();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => document.addEventListener(e, handleActivity));

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
    };
  }, [isAuthenticated, updateLastActivity]);
}
