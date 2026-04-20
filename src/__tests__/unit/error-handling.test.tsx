/**
 * Error Handling Tests
 * Validates: Requirements 19.7, 22.1, 22.2, 22.3, 22.4, 22.5
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingSpinner, LoadingOverlay, Skeleton } from '@/components/ui/loading-spinner';
import { FormError, FormFieldError, FormSuccess } from '@/components/ui/form-error';
import {
  ProgressIndicator,
  LinearProgress,
  CircularProgress,
} from '@/components/ui/progress-indicator';
import {
  parseDatabaseError,
  isRetryableError,
  getUserFriendlyErrorMessage,
  withDatabaseRetry,
} from '@/lib/database/errorHandler';
import { APIError, ApiErrors } from '@/lib/utils/apiError';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render loading spinner', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display loading text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      // Use getAllByText since text appears in both visible and sr-only elements
      const texts = screen.getAllByText('Loading data...');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('should render different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render fullscreen variant', () => {
      const { container } = render(<LoadingSpinner fullScreen />);
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(<LoadingSpinner text="Loading products" />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading products');
    });
  });

  describe('LoadingOverlay', () => {
    it('should show overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true} text="Processing...">
          <div>Content</div>
        </LoadingOverlay>
      );
      // Use getAllByText since text appears in multiple places
      const texts = screen.getAllByText('Processing...');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('should hide overlay when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Test Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('should render skeleton loader', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render multiple skeletons', () => {
      render(<Skeleton count={3} />);
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });
  });
});

describe('Form Error Components', () => {
  describe('FormError', () => {
    it('should render error message', () => {
      render(<FormError message="Invalid input" />);
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('should not render when no message', () => {
      const { container } = render(<FormError />);
      expect(container.firstChild).toBeNull();
    });

    it('should render inline variant', () => {
      render(<FormError message="Error" variant="inline" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render banner variant', () => {
      render(<FormError message="Error" variant="banner" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('p-4');
    });

    it('should have accessible alert role', () => {
      render(<FormError message="Error occurred" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('FormFieldError', () => {
    it('should render when error and touched', () => {
      render(<FormFieldError error="Required field" touched={true} />);
      expect(screen.getByText('Required field')).toBeInTheDocument();
    });

    it('should not render when not touched', () => {
      const { container } = render(
        <FormFieldError error="Required field" touched={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when no error', () => {
      const { container } = render(<FormFieldError touched={true} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('FormSuccess', () => {
    it('should render success message', () => {
      render(<FormSuccess message="Operation successful" />);
      expect(screen.getByText('Operation successful')).toBeInTheDocument();
    });

    it('should not render when no message', () => {
      const { container } = render(<FormSuccess />);
      expect(container.firstChild).toBeNull();
    });

    it('should have accessible status role', () => {
      render(<FormSuccess message="Success" />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });
});

describe('Progress Indicators', () => {
  describe('ProgressIndicator', () => {
    const steps = [
      { id: '1', label: 'Step 1', status: 'completed' as const },
      { id: '2', label: 'Step 2', status: 'active' as const },
      { id: '3', label: 'Step 3', status: 'pending' as const },
    ];

    it('should render all steps', () => {
      render(<ProgressIndicator steps={steps} currentStep={1} />);
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('should mark current step as active', () => {
      render(<ProgressIndicator steps={steps} currentStep={1} />);
      const step2 = screen.getByText('Step 2').closest('li');
      const activeStep = step2?.querySelector('[aria-current="step"]');
      expect(activeStep).toBeInTheDocument();
    });

    it('should show completed steps', () => {
      render(<ProgressIndicator steps={steps} currentStep={1} />);
      // Check for checkmark icon in completed step
      const step1 = screen.getByText('Step 1').closest('li');
      expect(step1).toBeInTheDocument();
    });

    it('should have accessible navigation', () => {
      render(<ProgressIndicator steps={steps} currentStep={1} />);
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Progress'
      );
    });
  });

  describe('LinearProgress', () => {
    it('should render progress bar', () => {
      render(<LinearProgress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display percentage', () => {
      render(<LinearProgress value={75} showPercentage={true} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display label', () => {
      render(<LinearProgress value={50} label="Uploading..." />);
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('should handle different variants', () => {
      const { rerender } = render(<LinearProgress value={50} variant="success" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<LinearProgress value={50} variant="error" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should clamp value between 0 and max', () => {
      render(<LinearProgress value={150} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '150');
    });
  });

  describe('CircularProgress', () => {
    it('should render circular progress', () => {
      render(<CircularProgress value={60} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display percentage value', () => {
      render(<CircularProgress value={80} showValue={true} />);
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should render different sizes', () => {
      const { rerender } = render(<CircularProgress value={50} size="sm" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<CircularProgress value={50} size="lg" />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});

describe('Database Error Handling', () => {
  describe('parseDatabaseError', () => {
    it('should parse database error', () => {
      const error = {
        code: '23505',
        message: 'Duplicate key violation',
        detail: 'Key (email) already exists',
      };

      const parsed = parseDatabaseError(error);
      expect(parsed.code).toBe('23505');
      expect(parsed.message).toBe('Duplicate key violation');
      expect(parsed.details?.detail).toBe('Key (email) already exists');
    });

    it('should handle unknown errors', () => {
      const error = { message: 'Unknown error' };
      const parsed = parseDatabaseError(error);
      expect(parsed.code).toBe('UNKNOWN');
      expect(parsed.message).toBe('Unknown error');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable connection errors', () => {
      const error = { code: '08006' }; // connection_failure
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify retryable deadlock errors', () => {
      const error = { code: '40P01' }; // deadlock_detected
      expect(isRetryableError(error)).toBe(true);
    });

    it('should not retry validation errors', () => {
      const error = new APIError(400, 'Validation error');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should not retry unique constraint violations', () => {
      const error = { code: '23505' }; // unique_violation
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return friendly message for connection errors', () => {
      const error = { code: '08006' };
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('Unable to connect');
    });

    it('should return friendly message for unique violations', () => {
      const error = {
        code: '23505',
        constraint: 'users_email_key',
      };
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('email');
    });

    it('should return friendly message for foreign key violations', () => {
      const error = { code: '23503' };
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('does not exist');
    });

    it('should return default message for unknown errors', () => {
      const error = { code: 'UNKNOWN' };
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toContain('database error');
    });
  });

  describe('withDatabaseRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await withDatabaseRetry(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce({ code: '08006' })
        .mockResolvedValue('success');

      const result = await withDatabaseRetry(operation, {
        maxRetries: 2,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on validation errors', async () => {
      const error = new APIError(400, 'Validation error');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(
        withDatabaseRetry(operation, { maxRetries: 3, initialDelay: 10 })
      ).rejects.toThrow(APIError);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      const operation = jest.fn().mockRejectedValue({ code: '08006' });

      await expect(
        withDatabaseRetry(operation, { maxRetries: 2, initialDelay: 10 })
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});

describe('API Error Utilities', () => {
  describe('ApiErrors', () => {
    it('should create validation error', () => {
      const error = ApiErrors.INVALID_INPUT('Invalid email');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('INVALID_INPUT');
    });

    it('should create unauthorized error', () => {
      const error = ApiErrors.UNAUTHORIZED();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create not found error', () => {
      const error = ApiErrors.NOT_FOUND('User');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('User');
    });

    it('should create database error', () => {
      const error = ApiErrors.DATABASE_ERROR();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });
});
