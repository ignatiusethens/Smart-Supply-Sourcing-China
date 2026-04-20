import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/authStore';
import { User } from '@/types';
import { SESSION_TIMEOUT, SESSION_WARNING_TIME } from '@/lib/utils/constants';

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('Authentication', () => {
    it('should initialize with no user', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should login user and set authentication state', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+254712345678',
        companyName: 'Test Company',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.sessionStartTime).toBeTruthy();
      expect(result.current.lastActivityTime).toBeTruthy();
    });

    it('should logout user and clear authentication state', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.sessionStartTime).toBeNull();
      expect(result.current.lastActivityTime).toBeNull();
    });

    it('should set user without login', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user when setUser is called with null', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should update last activity time', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      const initialActivityTime = result.current.lastActivityTime;

      // Wait a bit and update activity
      act(() => {
        result.current.updateLastActivity();
      });

      expect(result.current.lastActivityTime).toBeGreaterThanOrEqual(initialActivityTime!);
    });

    it('should not update activity when not authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      const initialActivityTime = result.current.lastActivityTime;

      act(() => {
        result.current.updateLastActivity();
      });

      expect(result.current.lastActivityTime).toBe(initialActivityTime);
    });

    it('should show and hide session warning', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.showSessionWarning).toBe(false);

      act(() => {
        result.current.showWarning();
      });

      expect(result.current.showSessionWarning).toBe(true);

      act(() => {
        result.current.hideWarning();
      });

      expect(result.current.showSessionWarning).toBe(false);
    });

    it('should expire session', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.sessionExpired).toBe(false);

      act(() => {
        result.current.expireSession();
      });

      expect(result.current.sessionExpired).toBe(true);
    });

    it('should clear expired session state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.expireSession();
        result.current.showWarning();
      });

      expect(result.current.sessionExpired).toBe(true);
      expect(result.current.showSessionWarning).toBe(true);

      act(() => {
        result.current.clearExpiredSession();
      });

      expect(result.current.sessionExpired).toBe(false);
      expect(result.current.showSessionWarning).toBe(false);
    });
  });

  describe('Session Timeout Calculations', () => {
    it('should calculate time until warning correctly', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      const timeUntilWarning = result.current.getTimeUntilWarning();
      expect(timeUntilWarning).toBeGreaterThan(0);
      expect(timeUntilWarning).toBeLessThanOrEqual(SESSION_WARNING_TIME);
    });

    it('should calculate time until expiration correctly', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      const timeUntilExpiration = result.current.getTimeUntilExpiration();
      expect(timeUntilExpiration).toBeGreaterThan(0);
      expect(timeUntilExpiration).toBeLessThanOrEqual(SESSION_TIMEOUT);
    });

    it('should return 0 when not authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.getTimeUntilWarning()).toBe(0);
      expect(result.current.getTimeUntilExpiration()).toBe(0);
    });
  });

  describe('Session Status', () => {
    it('should indicate session is active when authenticated', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.isSessionActive()).toBe(true);
    });

    it('should indicate session is inactive when not authenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isSessionActive()).toBe(false);
    });

    it('should indicate session is inactive when expired', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.isSessionActive()).toBe(true);

      act(() => {
        result.current.expireSession();
      });

      expect(result.current.isSessionActive()).toBe(false);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist user data to localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      act(() => {
        result.current.login(mockUser);
      });

      // Check localStorage
      const stored = localStorage.getItem('auth-storage');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.user).toEqual(mockUser);
      expect(parsed.state.isAuthenticated).toBe(true);
    });
  });
});
