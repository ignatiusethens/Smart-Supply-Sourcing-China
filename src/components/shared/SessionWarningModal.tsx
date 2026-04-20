'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';

export function SessionWarningModal() {
  const router = useRouter();
  const {
    showSessionWarning,
    sessionExpired,
    hideWarning,
    expireSession,
    logout,
    getTimeUntilExpiration,
  } = useAuthStore();

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(showSessionWarning);
  }, [showSessionWarning]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const remaining = getTimeUntilExpiration();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        expireSession();
        setIsOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, getTimeUntilExpiration, expireSession]);

  const handleContinueSession = () => {
    hideWarning();
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/');
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div 
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        role="alertdialog"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-description"
      >
        <h2 
          id="session-warning-title"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          Session Expiring Soon
        </h2>

        <p 
          id="session-warning-description"
          className="mb-6 text-gray-600"
        >
          Your session will expire in{' '}
          <span 
            className="font-mono font-bold text-red-600"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatTime(timeRemaining)}
          </span>
          . Would you like to continue your session?
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleContinueSession}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Continue your session"
          >
            Continue Session
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Logout from your account"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
