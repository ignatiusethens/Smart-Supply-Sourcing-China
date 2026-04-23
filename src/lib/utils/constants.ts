// Application Constants
export const APP_NAME = 'Smart Supply Sourcing';
export const MPESA_LIMIT = 300000; // KES 300,000
export const SESSION_TIMEOUT = 365 * 24 * 60 * 60 * 1000; // 1 year — effectively no timeout
export const SESSION_WARNING_TIME = 365 * 24 * 60 * 60 * 1000; // disabled

// Reference Code Configuration
export const REFERENCE_CODE_PREFIX = 'SSS';
export const REFERENCE_CODE_LENGTH = 6;

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

// Categories — default fallback list (overridden by DB via /api/admin/categories)
export const CATEGORIES: string[] = [
  'pumps-motors',
  'energy-systems',
  'fluid-control',
  'electrical',
  'storage',
];

// Availability Statuses
export const AVAILABILITY_STATUSES = [
  'in-stock',
  'pre-order',
  'out-of-stock',
] as const;

// Payment Methods
export const PAYMENT_METHODS = ['mpesa', 'bank-transfer'] as const;

// Order Statuses
export const ORDER_STATUSES = [
  'pending-payment',
  'payment-received',
  'processing',
  'shipped',
  'completed',
  'cancelled',
] as const;

// Payment Statuses
export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'pending-reconciliation',
  'received',
  'reconciled',
  'rejected',
] as const;
