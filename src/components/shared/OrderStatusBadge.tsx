'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: OrderStatus | PaymentStatus;
  type?: 'order' | 'payment';
}

export function OrderStatusBadge({
  status,
  type = 'order',
}: OrderStatusBadgeProps) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status) {
        case 'completed':
        case 'received':
        case 'reconciled':
          return 'success';
        case 'pending':
        case 'processing':
        case 'pending-reconciliation':
          return 'warning';
        case 'failed':
        case 'rejected':
          return 'destructive';
        default:
          return 'secondary';
      }
    }

    // Order status
    switch (status) {
      case 'completed':
        return 'success';
      case 'shipped':
      case 'processing':
        return 'info';
      case 'pending-payment':
      case 'payment-received':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge variant={getStatusColor(status, type) as any}>
      {getStatusLabel(status)}
    </Badge>
  );
}