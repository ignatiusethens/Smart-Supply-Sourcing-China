/**
 * Error Boundary Tests
 * Validates: Requirements 19.7, 22.1, 22.2, 22.3, 22.4, 22.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Component that renders children
const SafeComponent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

describe('Error Boundary', () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should catch errors thrown by children', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Something went wrong');
    });

    it('should display error message', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Test error message');
    });

    it('should render children when no error occurs', () => {
      const { container } = render(
        <ErrorBoundary>
          <SafeComponent>
            <div>Safe content</div>
          </SafeComponent>
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Safe content');
    });
  });

  describe('Error UI', () => {
    it('should display error alert with icon', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const alert = screen.getByText(/something went wrong/i);
      expect(alert).toBeInTheDocument();
    });

    it('should display try again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeInTheDocument();
    });

    it('should display go home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /go home/i });
      expect(button).toBeInTheDocument();
    });

    it('should display error message in code block', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error message/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when try again is clicked', async () => {
      const user = userEvent.setup();
      const { rerender, container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Something went wrong');

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Rerender with safe component
      rerender(
        <ErrorBoundary>
          <SafeComponent>
            <div>Safe content</div>
          </SafeComponent>
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Safe content');
    });

    it('should navigate home when go home button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      
      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;
      
      await user.click(goHomeButton);

      expect(window.location.href).toBe('/');
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (error: Error, reset: () => void) => (
        <div>
          <p>Custom error: {error.message}</p>
          <button onClick={reset}>Custom reset</button>
        </div>
      );

      const { container } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(container.textContent).toContain('Custom error: Test error message');
      expect(screen.getByRole('button', { name: /custom reset/i })).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { name: /something went wrong/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
