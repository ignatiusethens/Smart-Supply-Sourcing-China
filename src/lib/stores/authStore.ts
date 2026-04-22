import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { SESSION_TIMEOUT, SESSION_WARNING_TIME } from '@/lib/utils/constants';
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '@/lib/api/auth-client';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionStartTime: number | null;
  lastActivityTime: number | null;
  showSessionWarning: boolean;
  sessionExpired: boolean;

  // Actions
  setUser: (user: User | null, token?: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateLastActivity: () => void;
  showWarning: () => void;
  hideWarning: () => void;
  expireSession: () => void;
  clearExpiredSession: () => void;

  // Computed
  getTimeUntilWarning: () => number;
  getTimeUntilExpiration: () => number;
  isSessionActive: () => boolean;
  shouldShowWarning: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      sessionStartTime: null,
      lastActivityTime: null,
      showSessionWarning: false,
      sessionExpired: false,

      setUser: (user, token) => {
        if (token) {
          setAuthToken(token);
        }
        set({
          user,
          isAuthenticated: !!user,
          sessionStartTime: user ? Date.now() : null,
          lastActivityTime: user ? Date.now() : null,
        });
      },

      login: (user, token) => {
        const now = Date.now();
        setAuthToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          sessionStartTime: now,
          lastActivityTime: now,
          showSessionWarning: false,
          sessionExpired: false,
        });
      },

      logout: () => {
        removeAuthToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionStartTime: null,
          lastActivityTime: null,
          showSessionWarning: false,
          sessionExpired: false,
        });
      },

      updateLastActivity: () => {
        const state = get();
        if (state.isAuthenticated && !state.sessionExpired) {
          set({ lastActivityTime: Date.now() });
        }
      },

      showWarning: () => {
        set({ showSessionWarning: true });
      },

      hideWarning: () => {
        set({ showSessionWarning: false });
      },

      expireSession: () => {
        set({ sessionExpired: true });
      },

      clearExpiredSession: () => {
        set({
          sessionExpired: false,
          showSessionWarning: false,
        });
      },

      getTimeUntilWarning: () => {
        const state = get();
        if (!state.isAuthenticated || !state.lastActivityTime) return 0;

        const timeSinceLastActivity = Date.now() - state.lastActivityTime;
        const timeUntilWarning = SESSION_WARNING_TIME - timeSinceLastActivity;

        return Math.max(0, timeUntilWarning);
      },

      getTimeUntilExpiration: () => {
        const state = get();
        if (!state.isAuthenticated || !state.lastActivityTime) return 0;

        const timeSinceLastActivity = Date.now() - state.lastActivityTime;
        const timeUntilExpiration = SESSION_TIMEOUT - timeSinceLastActivity;

        return Math.max(0, timeUntilExpiration);
      },

      isSessionActive: () => {
        const state = get();
        if (
          !state.isAuthenticated ||
          !state.lastActivityTime ||
          state.sessionExpired
        ) {
          return false;
        }

        const timeSinceLastActivity = Date.now() - state.lastActivityTime;
        return timeSinceLastActivity < SESSION_TIMEOUT;
      },

      shouldShowWarning: () => {
        const state = get();
        if (!state.isAuthenticated || state.sessionExpired) return false;

        const timeUntilWarning = get().getTimeUntilWarning();
        return timeUntilWarning <= 0 && !state.showSessionWarning;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionStartTime: state.sessionStartTime,
        lastActivityTime: state.lastActivityTime,
      }),
    }
  )
);
