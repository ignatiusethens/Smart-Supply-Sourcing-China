/**
 * API Error Handler Middleware
 * Provides consistent error handling for Next.js API routes
 * Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIError, ApiErrors, ApiErrorResponse } from '@/lib/utils/apiError';
import { parseDatabaseError, getUserFriendlyErrorMessage } from '@/lib/database/errorHandler';
import { ZodError } from 'zod';

/**
 * API Route Handler Type
 */
export type ApiRouteHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  // Handle APIError instances
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    const message = firstError
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : 'Validation error';

    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'VALIDATION_ERROR',
        },
      },
      { status: 400 }
    );
  }

  // Handle database errors
  if (isDatabaseError(error)) {
    const dbError = parseDatabaseError(error);
    const userMessage = getUserFriendlyErrorMessage(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: userMessage,
          code: dbError.code,
        },
      },
      { status: 500 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred';

    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  );
}

/**
 * Check if error is a database error
 */
function isDatabaseError(error: any): boolean {
  return (
    error &&
    (error.code ||
      error.errno ||
      error.name === 'DatabaseError' ||
      error.name === 'PostgresError')
  );
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: any
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw ApiErrors.INVALID_INPUT('Invalid request body');
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: any
): T {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw ApiErrors.INVALID_INPUT('Invalid query parameters');
  }
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  code?: string,
  status: number = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status }
  );
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * CORS headers helper
 */
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  return response;
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleOptions(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}
