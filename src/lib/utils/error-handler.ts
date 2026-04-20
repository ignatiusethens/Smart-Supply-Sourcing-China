/**
 * Error Handling Utilities
 * Provides centralized error handling, retry mechanisms, and user-friendly error messages
 */

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler with retry mechanism
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new AppError(
          `Database operation failed after ${maxRetries} attempts: ${lastError.message}`,
          503,
          'DATABASE_ERROR'
        );
      }

      // Wait before retrying with exponential backoff
      await delay(delayMs * attempt);
    }
  }

  throw lastError;
}

/**
 * Check if error should not be retried
 */
function isNonRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // Don't retry client errors (4xx)
    return error.statusCode >= 400 && error.statusCode < 500;
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
  
  // Don't retry validation errors, auth errors, etc.
  return (
    errorMessage.includes('validation') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('not found') ||
    errorMessage.includes('duplicate')
  );
}

/**
 * Delay utility for retry mechanism
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);

  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'DATABASE_ERROR': 'We\'re having trouble connecting to our servers. Please try again in a moment.',
    'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'UNAUTHORIZED': 'You need to be logged in to perform this action.',
    'FORBIDDEN': 'You don\'t have permission to perform this action.',
    'NOT_FOUND': 'The requested resource was not found.',
    'TIMEOUT': 'The request took too long. Please try again.',
    'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
  };

  return errorMessages[apiError.code || ''] || apiError.message;
}

/**
 * Handle database connection errors
 */
export function handleDatabaseError(error: unknown): never {
  console.error('Database error:', error);

  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      throw new AppError(
        'Unable to connect to database. Please check your database connection.',
        503,
        'DATABASE_CONNECTION_ERROR'
      );
    }

    if (error.message.includes('timeout')) {
      throw new AppError(
        'Database query timeout. Please try again.',
        504,
        'DATABASE_TIMEOUT'
      );
    }

    if (error.message.includes('duplicate key')) {
      throw new AppError(
        'A record with this information already exists.',
        409,
        'DUPLICATE_RECORD'
      );
    }
  }

  throw new AppError(
    'A database error occurred. Please try again later.',
    500,
    'DATABASE_ERROR'
  );
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(error: unknown, defaultMessage: string = 'An error occurred') {
  const apiError = parseApiError(error);

  return {
    success: false,
    error: apiError.message || defaultMessage,
    code: apiError.code,
    statusCode: apiError.statusCode || 500,
  };
}

/**
 * Async operation with timeout
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new AppError(timeoutMessage, 504, 'TIMEOUT')), timeoutMs)
    ),
  ]);
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const apiError = parseApiError(error);
    return { data: fallback ?? null, error: apiError };
  }
}
