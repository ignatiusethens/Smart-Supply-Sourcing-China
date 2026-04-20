import { CartItem, Payment } from '@/types';

// Cart calculation functions
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function calculateItemSubtotal(
  unitPrice: number,
  quantity: number
): number {
  return unitPrice * quantity;
}

export function calculatePreOrderDeposit(items: CartItem[]): number {
  return items
    .filter(item => item.isPreOrder)
    .reduce((sum, item) => {
      return sum + (item.depositAmount || 0) * item.quantity;
    }, 0);
}

export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

// Payment and reconciliation calculations
export function calculateLedgerHealthScore(payments: Payment[]): number {
  if (payments.length === 0) return 0;

  const reconciledCount = payments.filter(
    p => p.status === 'reconciled'
  ).length;

  const score = (reconciledCount / payments.length) * 100;
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

export function calculateOutstandingBalance(payments: Payment[]): number {
  return payments
    .filter(p => p.status === 'pending' || p.status === 'pending-reconciliation')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculatePendingReconciliation(payments: Payment[]): number {
  return payments
    .filter(p => p.status === 'pending-reconciliation')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateReconciledAmount(payments: Payment[]): number {
  return payments
    .filter(p => p.status === 'reconciled')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function calculateRejectedAmount(payments: Payment[]): number {
  return payments
    .filter(p => p.status === 'rejected')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

// Percentage calculations
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100 * 100) / 100; // Round to 2 decimal places
}

// Tax calculations (for future use)
export function calculateVAT(amount: number, vatRate: number = 0.16): number {
  return Math.round(amount * vatRate * 100) / 100;
}

export function calculateAmountWithVAT(amount: number, vatRate: number = 0.16): number {
  return amount + calculateVAT(amount, vatRate);
}

export function calculateAmountExcludingVAT(amountWithVAT: number, vatRate: number = 0.16): number {
  return Math.round((amountWithVAT / (1 + vatRate)) * 100) / 100;
}

// Discount calculations
export function calculateDiscountAmount(
  originalAmount: number,
  discountPercentage: number
): number {
  return Math.round(originalAmount * (discountPercentage / 100) * 100) / 100;
}

export function calculateDiscountedAmount(
  originalAmount: number,
  discountPercentage: number
): number {
  const discountAmount = calculateDiscountAmount(originalAmount, discountPercentage);
  return originalAmount - discountAmount;
}

// Deposit calculations for pre-orders
export function calculateDepositAmount(
  totalAmount: number,
  depositPercentage: number
): number {
  return Math.round(totalAmount * (depositPercentage / 100) * 100) / 100;
}

export function calculateRemainingBalance(
  totalAmount: number,
  depositPaid: number
): number {
  return Math.max(0, totalAmount - depositPaid);
}

// Utility functions for financial calculations
export function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function roundToCurrency(amount: number): number {
  // Round to nearest cent/smallest currency unit
  return Math.round(amount);
}

// Statistical calculations for analytics
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return roundToTwoDecimals(sum / values.length);
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return roundToTwoDecimals((sorted[middle - 1] + sorted[middle]) / 2);
  } else {
    return sorted[middle];
  }
}

export function calculateSum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

export function calculateGrowthRate(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return roundToTwoDecimals(((currentValue - previousValue) / previousValue) * 100);
}