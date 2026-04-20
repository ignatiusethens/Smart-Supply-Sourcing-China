import { z } from 'zod';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(
  /^(\+254|254|0)[17]\d{8}$/,
  'Invalid Kenyan phone number format'
);
export const uuidSchema = z.string().uuid('Invalid UUID format');

// User validation schemas
export const userRoleSchema = z.enum(['buyer', 'admin']);

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  role: userRoleSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Product validation schemas
export const categorySchema = z.enum([
  'pumps-motors',
  'energy-systems',
  'fluid-control',
  'electrical',
  'storage'
]);

export const availabilityStatusSchema = z.enum([
  'in-stock',
  'pre-order',
  'out-of-stock'
]);

export const specificationSchema = z.object({
  label: z.string().min(1, 'Specification label is required'),
  value: z.string().min(1, 'Specification value is required'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: categorySchema,
  price: z.number().positive('Price must be positive'),
  availability: availabilityStatusSchema,
  stockLevel: z.number().int().min(0, 'Stock level must be non-negative'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  warrantyDuration: z.string().optional(),
  warrantyTerms: z.string().optional(),
  depositAmount: z.number().positive().optional(),
  depositPercentage: z.number().int().min(1).max(100).optional(),
  batchArrivalDate: z.string().optional(),
  escrowDetails: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  specifications: z.array(specificationSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productFiltersSchema = z.object({
  categories: z.array(categorySchema).default([]),
  availability: z.array(availabilityStatusSchema).default([]),
  priceRange: z.object({
    min: z.number().min(0).default(0),
    max: z.number().positive().default(Number.MAX_SAFE_INTEGER),
  }).default({ min: 0, max: Number.MAX_SAFE_INTEGER }),
  searchQuery: z.string().default(''),
});

// Order validation schemas
export const paymentMethodSchema = z.enum(['mpesa', 'bank-transfer']);
export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'pending-reconciliation',
  'received',
  'reconciled',
  'rejected'
]);
export const orderStatusSchema = z.enum([
  'pending-payment',
  'payment-received',
  'processing',
  'shipped',
  'completed',
  'cancelled'
]);

export const orderItemSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z.string().min(10, 'Shipping address must be at least 10 characters'),
  shippingCity: z.string().min(2, 'Shipping city must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  contactPhone: phoneSchema,
  paymentMethod: paymentMethodSchema,
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  description: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: paymentStatusSchema,
  transactionId: z.string().optional(),
});

// Payment validation schemas
export const mpesaPaymentSchema = z.object({
  orderId: uuidSchema,
  phoneNumber: phoneSchema,
});

export const reconcilePaymentSchema = z.object({
  action: z.enum(['received', 'reconciled', 'rejected']),
  rejectionReason: z.string().optional(),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  orderId: uuidSchema.optional(),
  sourcingRequestId: uuidSchema.optional(),
  folder: z.string().default('smart-supply-sourcing'),
});

// Sourcing request validation schemas
export const sourcingRequestStatusSchema = z.enum([
  'submitted',
  'under-review',
  'quoted',
  'accepted',
  'rejected'
]);

export const createSourcingRequestSchema = z.object({
  itemDescription: z.string().min(10, 'Item description must be at least 10 characters'),
  specifications: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  targetPrice: z.number().positive().optional(),
  deliveryLocation: z.string().min(5, 'Delivery location must be at least 5 characters'),
  timeline: z.string().optional(),
  complianceRequirements: z.string().optional(),
});

export const updateSourcingRequestSchema = z.object({
  status: sourcingRequestStatusSchema,
  adminNotes: z.string().optional(),
});

// Quote validation schemas
export const quoteStatusSchema = z.enum(['pending', 'accepted', 'expired', 'rejected']);

export const quoteLineItemSchema = z.object({
  description: z.string().min(5, 'Description must be at least 5 characters'),
  specifications: z.string().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
});

export const createQuoteSchema = z.object({
  sourcingRequestId: uuidSchema,
  lineItems: z.array(quoteLineItemSchema).min(1, 'At least one line item is required'),
  validUntil: z.string().datetime('Invalid date format'),
});

export const acceptQuoteSchema = z.object({
  paymentMethod: paymentMethodSchema,
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Search validation schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
});

// Reference code validation schema
export const referenceCodeSchema = z.string().regex(
  /^SSS-\d{4}-[A-Z0-9]{6}$/,
  'Invalid reference code format'
);

// Admin dashboard filters
export const adminOrderFiltersSchema = z.object({
  paymentStatus: z.array(paymentStatusSchema).optional(),
  orderStatus: z.array(orderStatusSchema).optional(),
  paymentMethod: z.array(paymentMethodSchema).optional(),
});

export const adminLedgerFiltersSchema = z.object({
  status: z.array(paymentStatusSchema).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().positive('Quantity must be positive'),
});

export const updateCartItemSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

// Validation helper functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePhoneNumber(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export function validateReferenceCode(code: string): boolean {
  return referenceCodeSchema.safeParse(code).success;
}

// Type inference from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type MpesaPaymentInput = z.infer<typeof mpesaPaymentSchema>;
export type CreateSourcingRequestInput = z.infer<typeof createSourcingRequestSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;