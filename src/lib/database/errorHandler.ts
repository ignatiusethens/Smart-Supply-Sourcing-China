/**
 * Database Error Handler
 * Provides comprehensive error handling and retry mechanisms for database operations
 * Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5
 */

import { APIError, ApiErrors } from '@/lib/utils/apiError';

export interface DatabaseErrorDetails {
  code: string;
  message: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
}

export class DatabaseError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Partial<DatabaseErrorDetails>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Parse PostgreSQL error into structured format
 */
export function parseDatabaseError(error: any): DatabaseError {
  const code = error.code || 'UNKNOWN';
  const message = error.message || 'Database operation failed';
  
  const details: Partial<DatabaseErrorDetails> = {
    code,
    message,
    detail: error.detail,
    hint: error.hint,
    position: error.position,
    internalPosition: error.internalPosition,
    internalQuery: error.internalQuery,
    where: error.where,
    schema: error.schema,
    table: error.table,
    column: error.column,
    dataType: error.dataType,
    constraint: error.constraint,
  };

  return new DatabaseError(code, message, details);
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (error instanceof APIError) {
    return false; // Don't retry validation errors
  }

  const retryableCodes = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '08007', // transaction_resolution_unknown
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '53000', // insufficient_resources
    '53100', // disk_full
    '53200', // out_of_memory
    '53300', // too_many_connections
    '57P03', // cannot_connect_now
    '58000', // system_error
    '58030', // io_error
  ];

  const code = error.code || error.errno || '';
  return retryableCodes.includes(code);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const dbError = parseDatabaseError(error);

  // Connection errors
  if (dbError.code.startsWith('08')) {
    return 'Unable to connect to the database. Please try again in a moment.';
  }

  // Unique constraint violation
  if (dbError.code === '23505') {
    if (dbError.details?.constraint?.includes('email')) {
      return 'This email address is already registered.';
    }
    if (dbError.details?.constraint?.includes('reference_code')) {
      return 'This reference code already exists. Please try again.';
    }
    return 'This record already exists.';
  }

  // Foreign key violation
  if (dbError.code === '23503') {
    return 'Referenced record does not exist.';
  }

  // Not null violation
  if (dbError.code === '23502') {
    return `Required field is missing: ${dbError.details?.column || 'unknown'}`;
  }

  // Check constraint violation
  if (dbError.code === '23514') {
    return 'Invalid data provided. Please check your input.';
  }

  // Serialization failure / deadlock
  if (dbError.code === '40001' || dbError.code === '40P01') {
    return 'Operation failed due to concurrent access. Please try again.';
  }

  // Resource errors
  if (dbError.code.startsWith('53')) {
    return 'Database is temporarily unavailable. Please try again later.';
  }

  // System errors
  if (dbError.code.startsWith('58')) {
    return 'A system error occurred. Please try again later.';
  }

  // Default message
  return 'A database error occurred. Please try again.';
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: (error: any) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffMultiplier: 2,
  retryableErrors: isRetryableError,
};

/**
 * Execute database operation with retry logic
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: any = null;
  let delay = finalConfig.initialDelay;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Log the error
      console.error(
        `Database operation failed (attempt ${attempt + 1}/${finalConfig.maxRetries}):`,
        error
      );

      // Check if error is retryable
      const shouldRetry =
        finalConfig.retryableErrors?.(error) ?? isRetryableError(error);

      if (!shouldRetry || attempt === finalConfig.maxRetries - 1) {
        break;
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * finalConfig.backoffMultiplier, finalConfig.maxDelay);
    }
  }

  // All retries failed, throw appropriate error
  if (lastError instanceof APIError) {
    throw lastError;
  }

  const dbError = parseDatabaseError(lastError);
  const userMessage = getUserFriendlyErrorMessage(lastError);
  
  throw new APIError(500, userMessage, dbError.code);
}

/**
 * Execute database transaction with retry logic
 */
export async function withDatabaseTransaction<T>(
  client: any,
  operation: (client: any) => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  return withDatabaseRetry(async () => {
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }, config);
}

/**
 * Handle database connection pool errors
 */
export function handlePoolError(error: any): void {
  console.error('Database pool error:', error);
  
  // Log specific error details
  const dbError = parseDatabaseError(error);
  console.error('Error details:', {
    code: dbError.code,
    message: dbError.message,
    details: dbError.details,
  });

  // You could add monitoring/alerting here
  // e.g., send to error tracking service
}

/**
 * Validate database connection
 */
export async function validateDatabaseConnection(pool: any): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection validation failed:', error);
    return false;
  }
}

/**
 * Get database health status
 */
export async function getDatabaseHealth(pool: any): Promise<{
  healthy: boolean;
  message: string;
  details?: any;
}> {
  try {
    const client = await pool.connect();
    
    // Check connection
    await client.query('SELECT 1');
    
    // Get pool stats
    const poolStats = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
    
    client.release();
    
    return {
      healthy: true,
      message: 'Database connection is healthy',
      details: poolStats,
    };
  } catch (error) {
    const dbError = parseDatabaseError(error);
    return {
      healthy: false,
      message: getUserFriendlyErrorMessage(error),
      details: {
        code: dbError.code,
        message: dbError.message,
      },
    };
  }
}
