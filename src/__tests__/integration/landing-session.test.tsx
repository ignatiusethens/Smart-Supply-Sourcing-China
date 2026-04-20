import { render, screen, waitFor } from '@testing-library/react';
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

      // Simulate clicking continue button
      const continueButton = screen.getByText('Continue Session') as HTMLButtonElement;
      continueButton.click();

      rerender(<SessionWarningModal />);

      await waitFor(() => {
        expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();
      });
    });
  });

  describe('Session State Management', () => {
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

      // Update activity
      authStore.updateLastActivity();

      // Activity time should be updated
      expect(authStore.lastActivityTime).toBeGreaterThanOrEqual(initialActivityTime!);
    });
  });

  describe('Session Warning Modal Interaction', () => {
    it('should hide warning modal', () => {
      const authStore = useAuthStore.getState();

      authStore.showWarning();
      authStore.hideWarning();

      expect(authStore.showSessionWarning).toBe(false);
    });
  });
});
