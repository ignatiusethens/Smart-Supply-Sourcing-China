import { PaymentMethod } from '@/types';

const MPESA_LIMIT = 300000; // KES 300,000

export function getAvailablePaymentMethods(orderTotal: number): PaymentMethod[] {
  if (orderTotal > MPESA_LIMIT) {
    return ['bank-transfer'];
  }
  return ['mpesa', 'bank-transfer'];
}

export function isPaymentMethodAllowed(
  method: PaymentMethod,
  orderTotal: number
): boolean {
  const availableMethods = getAvailablePaymentMethods(orderTotal);
  return availableMethods.includes(method);
}

export function getPaymentMethodRestrictionMessage(
  orderTotal: number
): string | null {
  if (orderTotal > MPESA_LIMIT) {
    return `Orders exceeding KES ${MPESA_LIMIT.toLocaleString()} must use Bank Transfer payment method.`;
  }
  return null;
}

export function getMpesaLimit(): number {
  return MPESA_LIMIT;
}

export function isOrderEligibleForMpesa(orderTotal: number): boolean {
  return orderTotal <= MPESA_LIMIT;
}