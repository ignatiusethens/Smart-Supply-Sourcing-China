/**
 * Form Validation Utilities
 * Provides reusable validation functions with clear error messages
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Phone number validation (Kenyan format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Kenyan phone format: +254XXXXXXXXX or 07XXXXXXXX or 01XXXXXXXX
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { valid: false, error: 'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)' };
  }

  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string = 'This field'): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Minimum length validation
 */
export function validateMinLength(value: string, minLength: number, fieldName: string = 'This field'): ValidationResult {
  if (value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { valid: true };
}

/**
 * Maximum length validation
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string = 'This field'): ValidationResult {
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { valid: true };
}

/**
 * Number validation
 */
export function validateNumber(value: string, fieldName: string = 'This field'): ValidationResult {
  if (isNaN(Number(value))) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  return { valid: true };
}

/**
 * Positive number validation
 */
export function validatePositiveNumber(value: number, fieldName: string = 'This field'): ValidationResult {
  if (value <= 0) {
    return { valid: false, error: `${fieldName} must be greater than zero` };
  }

  return { valid: true };
}

/**
 * Range validation
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'This field'
): ValidationResult {
  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { valid: true };
}

/**
 * Address validation
 */
export function validateAddress(address: string): ValidationResult {
  if (!address || address.trim() === '') {
    return { valid: false, error: 'Address is required' };
  }

  if (address.length < 10) {
    return { valid: false, error: 'Please enter a complete address (at least 10 characters)' };
  }

  return { valid: true };
}

/**
 * Quantity validation
 */
export function validateQuantity(quantity: number): ValidationResult {
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'Quantity must be a whole number' };
  }

  if (quantity < 1) {
    return { valid: false, error: 'Quantity must be at least 1' };
  }

  if (quantity > 1000) {
    return { valid: false, error: 'Quantity cannot exceed 1000' };
  }

  return { valid: true };
}

/**
 * Price validation
 */
export function validatePrice(price: number): ValidationResult {
  if (price < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }

  if (price > 100000000) {
    return { valid: false, error: 'Price is too high' };
  }

  return { valid: true };
}

/**
 * File validation
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): ValidationResult {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must not exceed ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  allowedTypes: string[],
  maxSizeMB: number,
  maxFiles: number
): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: 'Please select at least one file' };
  }

  if (files.length > maxFiles) {
    return { valid: false, error: `You can upload a maximum of ${maxFiles} files` };
  }

  for (const file of files) {
    const fileValidation = validateFile(file, allowedTypes, maxSizeMB);
    if (!fileValidation.valid) {
      return fileValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate form data
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  validators: { [K in keyof T]?: (value: T[K]) => ValidationResult }
): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  for (const field in validators) {
    const validator = validators[field];
    if (validator) {
      const result = validator(data[field]);
      if (!result.valid && result.error) {
        errors[field] = result.error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Checkout form validation
 */
export interface CheckoutFormData {
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  paymentMethod: 'mpesa' | 'bank-transfer';
}

export function validateCheckoutForm(data: CheckoutFormData): { valid: boolean; errors: FormErrors } {
  return validateForm(data, {
    shippingAddress: (value) => validateAddress(value as string),
    shippingCity: (value) => validateRequired(value as string, 'City'),
    contactName: (value) => {
      const required = validateRequired(value as string, 'Contact name');
      if (!required.valid) return required;
      return validateMinLength(value as string, 2, 'Contact name');
    },
    contactPhone: (value) => validatePhone(value as string),
    paymentMethod: (value) => {
      if (!value || (value !== 'mpesa' && value !== 'bank-transfer')) {
        return { valid: false, error: 'Please select a payment method' };
      }
      return { valid: true };
    },
  });
}

/**
 * Sourcing request form validation
 */
export interface SourcingRequestFormData {
  itemDescription: string;
  specifications?: string;
  quantity: number;
  targetPrice?: number;
  deliveryLocation: string;
  timeline?: string;
  complianceRequirements?: string;
}

export function validateSourcingRequestForm(
  data: SourcingRequestFormData
): { valid: boolean; errors: FormErrors } {
  return validateForm(data, {
    itemDescription: (value) => {
      const required = validateRequired(value as string, 'Item description');
      if (!required.valid) return required;
      return validateMinLength(value as string, 10, 'Item description');
    },
    quantity: (value) => validateQuantity(value as number),
    deliveryLocation: (value) => validateRequired(value as string, 'Delivery location'),
    targetPrice: (value) => {
      if (value !== undefined && value !== null) {
        return validatePrice(value as number);
      }
      return { valid: true };
    },
  });
}
