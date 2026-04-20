// Application Constants
export const APP_NAME = 'Smart Supply Sourcing';
export const MPESA_LIMIT = 300000; // KES 300,000
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
export const SESSION_WARNING_TIME = 28 * 60 * 1000; // 28 minutes in milliseconds

// Reference Code Configuration
export const REFERENCE_CODE_PREFIX = 'SSS';
export const REFERENCE_CODE_LENGTH = 6;

// File Upload Limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Categories
export const CATEGORIES = [
  'pumps-motors',
  'energy-systems',
  'fluid-control',
  'electrical',
  'storage',
] as const;

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