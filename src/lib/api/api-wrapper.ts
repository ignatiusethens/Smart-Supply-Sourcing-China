/**
 * API Wrapper with Error Handling
 * Provides consistent API error handling and retry logic
 */

import { AppError, withTimeout, parseApiError } from '@/lib/utils/error-handler';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  statusCode?: number;
}

/**
 * Fetch with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('Request timeout', 504, 'TIMEOUT');
    }

    throw error;
  }
}

/**
 * API request with error handling
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithTimeout(url, options);

    // Parse response
    const data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
        code: data.code || 'API_ERROR',
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data.data || data,
      statusCode: response.status,
    };
  } catch (error) {
    const apiError = parseApiError(error);

    return {
      success: false,
      error: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T = unknown>(
  url: string,
  headers?: HeadersInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * POST request
 */
export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  headers?: HeadersInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  headers?: HeadersInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(
  url: string,
  headers?: HeadersInit
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Upload file with progress
 */
export async function apiUpload<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', async () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            data: data.data || data,
            statusCode: xhr.status,
          });
        } else {
          resolve({
            success: false,
            error: data.error || 'Upload failed',
            code: data.code || 'UPLOAD_ERROR',
            statusCode: xhr.status,
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: 'Failed to parse response',
          code: 'PARSE_ERROR',
          statusCode: xhr.status,
        });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({
        success: false,
        error: 'Network error during upload',
        code: 'NETWORK_ERROR',
        statusCode: 0,
      });
    });

    xhr.addEventListener('timeout', () => {
      resolve({
        success: false,
        error: 'Upload timeout',
        code: 'TIMEOUT',
        statusCode: 0,
      });
    });

    xhr.open('POST', url);
    xhr.timeout = 60000; // 60 second timeout for uploads
    xhr.send(formData);
  });
}
