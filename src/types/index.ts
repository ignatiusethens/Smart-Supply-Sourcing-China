// Core Types
export type Category = 'pumps-motors' | 'energy-systems' | 'fluid-control' | 'electrical' | 'storage';
export type AvailabilityStatus = 'in-stock' | 'pre-order' | 'out-of-stock';
export type PaymentMethod = 'mpesa' | 'bank-transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'pending-reconciliation' | 'received' | 'reconciled' | 'rejected';
export type OrderStatus = 'pending-payment' | 'payment-received' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type SourcingRequestStatus = 'submitted' | 'under-review' | 'quoted' | 'accepted' | 'rejected';
export type QuoteStatus = 'pending' | 'accepted' | 'expired' | 'rejected';
export type UserRole = 'buyer' | 'admin';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Specification {
  id: string;
  productId: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  availability: AvailabilityStatus;
  stockLevel: number;
  description: string;
  warrantyDuration?: string;
  warrantyTerms?: string;
  depositAmount?: number;
  depositPercentage?: number;
  batchArrivalDate?: string;
  escrowDetails?: string;
  imageUrls: string[];
  specifications: Specification[];
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isPreOrder: boolean;
}

export interface TimelineEvent {
  id: string;
  orderId: string;
  status: string;
  description: string;
  actorId?: string;
  actor?: User;
  createdAt: string;
}

export interface Order {
  id: string;
  referenceCode: string;
  buyerId: string;
  buyer?: User;
  totalAmount: number;
  depositAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  items: OrderItem[];
  timeline: TimelineEvent[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface PaymentProof {
  id: string;
  paymentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  rejectionReason?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  proofs: PaymentProof[];
  createdAt: string;
  updatedAt: string;
}

// Sourcing Types
export interface SourcingAttachment {
  id: string;
  sourcingRequestId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
}

export interface SourcingRequest {
  id: string;
  buyerId: string;
  buyer?: User;
  itemDescription: string;
  specifications?: string;
  quantity: number;
  targetPrice?: number;
  deliveryLocation: string;
  timeline?: string;
  complianceRequirements?: string;
  status: SourcingRequestStatus;
  adminNotes?: string;
  attachments: SourcingAttachment[];
  quotes: Quote[];
  createdAt: string;
  updatedAt: string;
}

// Quote Types
export interface QuoteLineItem {
  id: string;
  quoteId: string;
  description: string;
  specifications?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  sourcingRequestId: string;
  buyerId: string;
  totalAmount: number;
  validUntil: string;
  status: QuoteStatus;
  orderId?: string;
  lineItems: QuoteLineItem[];
  createdAt: string;
  acceptedAt?: string;
}

// Invoice Types
export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  specifications?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceVerificationFile {
  id: string;
  invoiceId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploadedAt: string;
}

export interface Invoice {
  id: string;
  sourcingRequestId?: string;
  quoteId?: string;
  orderId?: string;
  buyerId: string;
  buyer?: User;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'pending-payment' | 'paid' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions?: string;
  paymentInstructions?: string;
  settlementInstructions?: string;
  logisticsNotes?: string;
  adminComments?: string;
  lineItems: InvoiceLineItem[];
  verificationGallery: InvoiceVerificationFile[];
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Types (Client-side only)
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availability: AvailabilityStatus;
  isPreOrder: boolean;
  depositAmount?: number;
  depositPercentage?: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Filter Types
export interface ProductFilters {
  categories: Category[];
  availability: AvailabilityStatus[];
  priceRange: { min: number; max: number };
  searchQuery: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: string;
  shippingCity: string;
  contactName: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
}

export interface CreateSourcingRequestRequest {
  itemDescription: string;
  specifications?: string;
  quantity: number;
  targetPrice?: number;
  deliveryLocation: string;
  timeline?: string;
  complianceRequirements?: string;
  attachments?: File[];
}

export interface CreateQuoteRequest {
  sourcingRequestId: string;
  lineItems: {
    description: string;
    specifications?: string;
    quantity: number;
    unitPrice: number;
  }[];
  validUntil: string;
}