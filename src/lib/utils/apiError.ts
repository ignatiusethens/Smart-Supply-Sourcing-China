/**
 * API Error Handler
 * Provides consistent error handling and responses across API routes
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const ApiErrors = {
  // 400 Bad Request
  INVALID_INPUT: (message = 'Invalid input provided') =>
    new APIError(400, message, 'INVALID_INPUT'),
  MISSING_REQUIRED_FIELD: (field: string) =>
    new APIError(400, `${field} is required`, 'MISSING_REQUIRED_FIELD'),
  INVALID_EMAIL: () =>
    new APIError(400, 'Invalid email format', 'INVALID_EMAIL'),
  INVALID_PHONE: () =>
    new APIError(400, 'Invalid phone number format', 'INVALID_PHONE'),
  INVALID_PASSWORD: () =>
    new APIError(400, 'Password must be at least 6 characters', 'INVALID_PASSWORD'),

  // 401 Unauthorized
  UNAUTHORIZED: (message = 'Unauthorized') =>
    new APIError(401, message, 'UNAUTHORIZED'),
  INVALID_CREDENTIALS: () =>
    new APIError(401, 'Invalid email or password', 'INVALID_CREDENTIALS'),
  SESSION_EXPIRED: () =>
    new APIError(401, 'Session has expired', 'SESSION_EXPIRED'),

  // 403 Forbidden
  FORBIDDEN: (message = 'Access denied') =>
    new APIError(403, message, 'FORBIDDEN'),
  INSUFFICIENT_PERMISSIONS: () =>
    new APIError(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'),

  // 404 Not Found
  NOT_FOUND: (resource: string) =>
    new APIError(404, `${resource} not found`, 'NOT_FOUND'),
  USER_NOT_FOUND: () =>
    new APIError(404, 'User not found', 'USER_NOT_FOUND'),
  PRODUCT_NOT_FOUND: () =>
    new APIError(404, 'Product not found', 'PRODUCT_NOT_FOUND'),
  ORDER_NOT_FOUND: () =>
    new APIError(404, 'Order not found', 'ORDER_NOT_FOUND'),

  // 409 Conflict
  CONFLICT: (message: string) =>
    new APIError(409, message, 'CONFLICT'),
  EMAIL_ALREADY_EXISTS: () =>
    new APIError(409, 'Email already registered', 'EMAIL_ALREADY_EXISTS'),
  DUPLICATE_REFERENCE_CODE: () =>
    new APIError(409, 'Reference code already exists', 'DUPLICATE_REFERENCE_CODE'),

  // 422 Unprocessable Entity
  VALIDATION_ERROR: (message: string) =>
    new APIError(422, message, 'VALIDATION_ERROR'),

  // 500 Internal Server Error
  INTERNAL_ERROR: (message = 'Internal server error') =>
    new APIError(500, message, 'INTERNAL_ERROR'),
  DATABASE_ERROR: () =>
    new APIError(500, 'Database error', 'DATABASE_ERROR'),
  FILE_UPLOAD_ERROR: () =>
    new APIError(500, 'File upload failed', 'FILE_UPLOAD_ERROR'),
};

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Handle database connection errors with retry logic
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Database operation failed (attempt ${i + 1}/${maxRetries}):`, error);

      // Don't retry on validation errors
      if (error instanceof APIError && error.statusCode === 400) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }
  }

  throw lastError || ApiErrors.DATABASE_ERROR();
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  data: Record<string, any>,
  fields: string[]
): void {
  for (const field of fields) {
    if (!data[field]) {
      throw ApiErrors.MISSING_REQUIRED_FIELD(field);
    }
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ApiErrors.INVALID_EMAIL();
  }
}

/**
 * Validate phone number format (Kenyan format)
 */
export function validatePhoneNumber(phone: string): void {
  const phoneRegex = /^(\+254|0)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw ApiErrors.INVALID_PHONE();
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): void {
  if (password.length < 6) {
    throw ApiErrors.INVALID_PASSWORD();
  }
}
