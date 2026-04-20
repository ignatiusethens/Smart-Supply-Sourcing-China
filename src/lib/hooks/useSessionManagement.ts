'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { SESSION_TIMEOUT, SESSION_WARNING_TIME } from '@/lib/utils/constants';

/**
 * Hook to manage session timeout and warning
 * Tracks user activity and shows warning modal before session expires
 */
export function useSessionManagement() {
  const {
    isAuthenticated,
    updateLastActivity,
    showWarning,
    hideWarning,
    expireSession,
    shouldShowWarning,
    getTimeUntilExpiration,
  } = useAuthStore();

  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      updateLastActivity();
      warningShownRef.current = false;
      hideWarning();
    };

    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity, hideWarning]);

  // Check for session timeout and warning
  useEffect(() => {
    if (!isAuthenticated) return;

    checkIntervalRef.current = setInterval(() => {
      const timeUntilExpiration = getTimeUntilExpiration();

      // Show warning at 28 minutes (SESSION_WARNING_TIME)
      if (
        timeUntilExpiration <= SESSION_WARNING_TIME &&
        timeUntilExpiration > 0 &&
        !warningShownRef.current
      ) {
        warningShownRef.current = true;
        showWarning();
      }

      // Expire session at 30 minutes (SESSION_TIMEOUT)
      if (timeUntilExpiration <= 0) {
        expireSession();
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAuthenticated, getTimeUntilExpiration, showWarning, expireSession]);
}
