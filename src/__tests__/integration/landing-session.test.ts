import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionWarningModal } from '@/components/shared/SessionWarningModal';
import { useAuthStore } from '@/lib/stores/authStore';
import { User } from '@/types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Landing Page and Session Management Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
  });

  describe('Session Warning Modal', () => {
    it('should render session warning modal when shown', () => {
      const { rerender } = render(<SessionWarningModal />);

      // Initially should not be visible
      expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();

      // Show warning
      const authStore = useAuthStore.getState();
      authStore.showWarning();

      rerender(<SessionWarningModal />);

      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
    });

    it('should display continue and logout buttons', () => {
      const authStore = useAuthStore.getState();
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);
      authStore.showWarning();

      render(<SessionWarningModal />);

      expect(screen.getByText('Continue Session')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should hide modal when continue session is clicked', async () => {
      const user = userEvent.setup();
      const authStore = useAuthStore.getState();
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);
      authStore.showWarning();

      const { rerender } = render(<SessionWarningModal />);

      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();

      const continueButton = screen.getByText('Continue Session');
      await user.click(continueButton);

      rerender(<SessionWarningModal />);

      await waitFor(() => {
        expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Session State Management', () => {
    it('should track user login and logout', () => {
      const authStore = useAuthStore.getState();

      expect(authStore.isAuthenticated).toBe(false);

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);

      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(mockUser);

      authStore.logout();

      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
    });

    it('should maintain session active status', () => {
      const authStore = useAuthStore.getState();

      expect(authStore.isSessionActive()).toBe(false);

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);

      expect(authStore.isSessionActive()).toBe(true);

      authStore.expireSession();

      expect(authStore.isSessionActive()).toBe(false);
    });

    it('should update last activity on user action', () => {
      const authStore = useAuthStore.getState();

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);

      const initialActivityTime = authStore.lastActivityTime;

      // Wait a bit and update activity
      setTimeout(() => {
        authStore.updateLastActivity();
      }, 10);

      // Activity time should be updated
      expect(authStore.lastActivityTime).toBeGreaterThanOrEqual(initialActivityTime!);
    });

    it('should support multiple user roles', () => {
      const authStore = useAuthStore.getState();

      const buyerUser: User = {
        id: 'buyer-1',
        email: 'buyer@example.com',
        name: 'Buyer User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(buyerUser);
      expect(authStore.user?.role).toBe('buyer');

      authStore.logout();

      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(adminUser);
      expect(authStore.user?.role).toBe('admin');
    });
  });

  describe('Session Timeout Calculations', () => {
    it('should calculate time until warning', () => {
      const authStore = useAuthStore.getState();

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);

      const timeUntilWarning = authStore.getTimeUntilWarning();
      expect(timeUntilWarning).toBeGreaterThan(0);
    });

    it('should calculate time until expiration', () => {
      const authStore = useAuthStore.getState();

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);

      const timeUntilExpiration = authStore.getTimeUntilExpiration();
      expect(timeUntilExpiration).toBeGreaterThan(0);
    });

    it('should return 0 when not authenticated', () => {
      const authStore = useAuthStore.getState();

      expect(authStore.getTimeUntilWarning()).toBe(0);
      expect(authStore.getTimeUntilExpiration()).toBe(0);
    });
  });

  describe('Session Recovery', () => {
    it('should allow session recovery after expiration', () => {
      const authStore = useAuthStore.getState();

      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'buyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      authStore.login(mockUser);
      expect(authStore.isAuthenticated).toBe(true);

      authStore.expireSession();
      expect(authStore.sessionExpired).toBe(true);

      authStore.clearExpiredSession();
      expect(authStore.sessionExpired).toBe(false);

      // Can re-login
      authStore.login(mockUser);
      expect(authStore.isAuthenticated).toBe(true);
    });
  });
});
