// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string; // for validation errors
  details?: Record<string, any>;
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

// Database Query Result Types
export interface DatabaseProduct {
  id: string;
  name: string;
  category: string;
  price: string; // Decimal comes as string from DB
  availability: string;
  stock_level: number;
  description: string;
  warranty_duration?: string;
  warranty_terms?: string;
  deposit_amount?: string; // Decimal comes as string from DB
  deposit_percentage?: number;
  batch_arrival_date?: string;
  escrow_details?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  reference_code: string;
  buyer_id: string;
  total_amount: string; // Decimal comes as string from DB
  deposit_amount?: string; // Decimal comes as string from DB
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_address: string;
  shipping_city: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company_name?: string;
  role: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Request/Response Types for specific endpoints
export interface GetProductsRequest {
  categories?: string[];
  availability?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

export interface CreateOrderResponse {
  order: Order;
  paymentInstructions?: {
    method: PaymentMethod;
    instructions: string;
    referenceCode: string;
  };
}

export interface MpesaPaymentRequest {
  orderId: string;
  phoneNumber: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  checkoutRequestId?: string;
}

export interface PaymentProofUploadRequest {
  orderId: string;
  files: File[];
}

export interface PaymentProofUploadResponse {
  proofs: PaymentProof[];
  message: string;
}

export interface ReconcilePaymentRequest {
  action: 'received' | 'reconciled' | 'rejected';
  rejectionReason?: string;
}

export interface ReconcilePaymentResponse {
  payment: Payment;
  order: Order;
  message: string;
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

export interface CreateSourcingRequestResponse {
  sourcingRequest: SourcingRequest;
  message: string;
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

export interface CreateQuoteResponse {
  quote: Quote;
  message: string;
}

export interface AcceptQuoteRequest {
  paymentMethod: PaymentMethod;
}

export interface AcceptQuoteResponse {
  order: Order;
  message: string;
}

export interface DashboardKPIs {
  outstandingTransfers: number;
  pendingReconciliations: number;
  activeSourcingRequests: number;
  dailyTransactionVolume: number;
  ledgerHealthScore: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface LedgerEntry {
  id: string;
  orderId: string;
  referenceCode: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  buyerName: string;
  buyerCompany?: string;
  proofCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloudinaryUploadRequest {
  files: File[];
  folder?: string;
}

export interface CloudinaryUploadResponse {
  uploads: CloudinaryUploadResult[];
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DatabaseError {
  code: string;
  message: string;
  detail?: string;
  constraint?: string;
}

export interface AuthenticationError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS';
  message: string;
}

export interface NotFoundError {
  code: 'NOT_FOUND';
  message: string;
  resource: string;
  id?: string;
}

// Import types from main types file
import { 
  Product, 
  Order, 
  Payment, 
  PaymentProof, 
  PaymentMethod, 
  PaymentStatus, 
  SourcingRequest, 
  Quote 
} from './index';