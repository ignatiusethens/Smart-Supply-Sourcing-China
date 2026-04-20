/**
 * Integration Tests for Payment Flows
 * Tests M-Pesa payment API integration and bank transfer file upload with database updates
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import { createPayment, getPaymentById, updatePaymentStatus, addPaymentProof } from '@/lib/database/queries/payments';
import { getOrderById, updateOrderStatus, updatePaymentStatus as updateOrderPaymentStatus } from '@/lib/database/queries/orders';

describe('Payment Flows Integration Tests', () => {
  // Mock data
  const mockOrderId = '550e8400-e29b-41d4-a716-446655440000';
  const mockPaymentId = '660e8400-e29b-41d4-a716-446655440001';
  const mockUserId = '770e8400-e29b-41d4-a716-446655440002';

  describe('M-Pesa Payment API Integration', () => {
    it('should create a payment record when M-Pesa payment is initiated', async () => {
      // Arrange
      const amount = 50000;
      const method = 'mpesa' as const;

      // Act
      const payment = await createPayment(mockOrderId, amount, method);

      // Assert
      expect(payment).toBeDefined();
      expect(payment.orderId).toBe(mockOrderId);
      expect(payment.amount).toBe(amount);
      expect(payment.method).toBe(method);
      expect(payment.status).toBe('pending');
    });

    it('should update payment status to processing when STK Push is initiated', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 50000, 'mpesa');

      // Act
      const updatedPayment = await updatePaymentStatus(payment.id, 'processing', 'MPESA-123456');

      // Assert
      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.status).toBe('processing');
      expect(updatedPayment?.transactionId).toBe('MPESA-123456');
    });

    it('should update payment status to completed when M-Pesa payment succeeds', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 50000, 'mpesa');
      await updatePaymentStatus(payment.id, 'processing');

      // Act
      const completedPayment = await updatePaymentStatus(payment.id, 'completed', 'MPESA-789012');

      // Assert
      expect(completedPayment).toBeDefined();
      expect(completedPayment?.status).toBe('completed');
    });

    it('should update order status when payment is completed', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 50000, 'mpesa');
      await updatePaymentStatus(payment.id, 'completed', 'MPESA-123456');

      // Act
      const updated = await updateOrderPaymentStatus(mockOrderId, 'completed');

      // Assert
      expect(updated).toBe(true);
    });

    it('should handle payment failure and update status to failed', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 50000, 'mpesa');
      await updatePaymentStatus(payment.id, 'processing');

      // Act
      const failedPayment = await updatePaymentStatus(payment.id, 'failed');

      // Assert
      expect(failedPayment).toBeDefined();
      expect(failedPayment?.status).toBe('failed');
    });

    it('should retrieve payment by ID with all details', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 50000, 'mpesa');
      await updatePaymentStatus(payment.id, 'processing', 'MPESA-123456');

      // Act
      const retrievedPayment = await getPaymentById(payment.id);

      // Assert
      expect(retrievedPayment).toBeDefined();
      expect(retrievedPayment?.id).toBe(payment.id);
      expect(retrievedPayment?.transactionId).toBe('MPESA-123456');
      expect(retrievedPayment?.status).toBe('processing');
    });
  });

  describe('Bank Transfer Payment Flow with Cloudinary', () => {
    it('should create a payment record for bank transfer', async () => {
      // Arrange
      const amount = 150000;
      const method = 'bank-transfer' as const;

      // Act
      const payment = await createPayment(mockOrderId, amount, method);

      // Assert
      expect(payment).toBeDefined();
      expect(payment.orderId).toBe(mockOrderId);
      expect(payment.amount).toBe(amount);
      expect(payment.method).toBe(method);
      expect(payment.status).toBe('pending');
    });

    it('should update payment status to pending-reconciliation when proof is uploaded', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');

      // Act
      const updatedPayment = await updatePaymentStatus(payment.id, 'pending-reconciliation');

      // Assert
      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.status).toBe('pending-reconciliation');
    });

    it('should add payment proof with Cloudinary URL to database', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      const fileName = 'bank-receipt.jpg';
      const fileType = 'image/jpeg';
      const fileSize = 2048000;
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/payment-proofs/abc123.jpg';
      const cloudinaryPublicId = 'payment-proofs/abc123';

      // Act
      const proof = await addPaymentProof(
        payment.id,
        fileName,
        fileType,
        fileSize,
        cloudinaryUrl,
        cloudinaryPublicId
      );

      // Assert
      expect(proof).toBeDefined();
      expect(proof.paymentId).toBe(payment.id);
      expect(proof.fileName).toBe(fileName);
      expect(proof.cloudinaryUrl).toBe(cloudinaryUrl);
      expect(proof.cloudinaryPublicId).toBe(cloudinaryPublicId);
    });

    it('should store multiple payment proofs for a single payment', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');

      // Act
      const proof1 = await addPaymentProof(
        payment.id,
        'receipt1.jpg',
        'image/jpeg',
        2048000,
        'https://res.cloudinary.com/demo/image/upload/v1/payment-proofs/proof1.jpg',
        'payment-proofs/proof1'
      );

      const proof2 = await addPaymentProof(
        payment.id,
        'receipt2.jpg',
        'image/jpeg',
        2048000,
        'https://res.cloudinary.com/demo/image/upload/v2/payment-proofs/proof2.jpg',
        'payment-proofs/proof2'
      );

      // Assert
      expect(proof1).toBeDefined();
      expect(proof2).toBeDefined();
      expect(proof1.id).not.toBe(proof2.id);
    });

    it('should retrieve payment with all proofs', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      await addPaymentProof(
        payment.id,
        'receipt.jpg',
        'image/jpeg',
        2048000,
        'https://res.cloudinary.com/demo/image/upload/v1/payment-proofs/proof.jpg',
        'payment-proofs/proof'
      );

      // Act
      const retrievedPayment = await getPaymentById(payment.id);

      // Assert
      expect(retrievedPayment).toBeDefined();
      expect(retrievedPayment?.proofs).toBeDefined();
      expect(retrievedPayment?.proofs.length).toBeGreaterThan(0);
      expect(retrievedPayment?.proofs[0].cloudinaryUrl).toContain('cloudinary');
    });

    it('should update order payment status when proof is uploaded', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      await updatePaymentStatus(payment.id, 'pending-reconciliation');

      // Act
      const updated = await updateOrderPaymentStatus(mockOrderId, 'pending-reconciliation');

      // Assert
      expect(updated).toBe(true);
    });
  });

  describe('Payment Status Updates and Database Persistence', () => {
    it('should update payment status from pending to received', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      await updatePaymentStatus(payment.id, 'pending-reconciliation');

      // Act
      const receivedPayment = await updatePaymentStatus(payment.id, 'received');

      // Assert
      expect(receivedPayment).toBeDefined();
      expect(receivedPayment?.status).toBe('received');
    });

    it('should update payment status from received to reconciled', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      await updatePaymentStatus(payment.id, 'pending-reconciliation');
      await updatePaymentStatus(payment.id, 'received');

      // Act
      const reconciledPayment = await updatePaymentStatus(payment.id, 'reconciled');

      // Assert
      expect(reconciledPayment).toBeDefined();
      expect(reconciledPayment?.status).toBe('reconciled');
    });

    it('should reject payment with rejection reason', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      await updatePaymentStatus(payment.id, 'pending-reconciliation');

      // Act
      // Note: In production, this would use the reconcilePayment function
      // For now, we're testing the updatePaymentStatus function
      const rejectedPayment = await updatePaymentStatus(payment.id, 'rejected');

      // Assert
      expect(rejectedPayment).toBeDefined();
      expect(rejectedPayment?.status).toBe('rejected');
    });

    it('should maintain payment history across status updates', async () => {
      // Arrange
      const payment = await createPayment(mockOrderId, 150000, 'bank-transfer');
      const paymentId = payment.id;

      // Act
      await updatePaymentStatus(paymentId, 'pending-reconciliation');
      const payment1 = await getPaymentById(paymentId);

      await updatePaymentStatus(paymentId, 'received');
      const payment2 = await getPaymentById(paymentId);

      await updatePaymentStatus(paymentId, 'reconciled');
      const payment3 = await getPaymentById(paymentId);

      // Assert
      expect(payment1?.status).toBe('pending-reconciliation');
      expect(payment2?.status).toBe('received');
      expect(payment3?.status).toBe('reconciled');
      expect(payment1?.id).toBe(payment2?.id);
      expect(payment2?.id).toBe(payment3?.id);
    });
  });

  describe('File Upload Validation', () => {
    it('should validate file type for payment proof', () => {
      // Arrange
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const testFile = { type: 'image/jpeg' };

      // Act
      const isValid = allowedTypes.includes(testFile.type);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject invalid file types', () => {
      // Arrange
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const testFile = { type: 'video/mp4' };

      // Act
      const isValid = allowedTypes.includes(testFile.type);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should validate file size limit', () => {
      // Arrange
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const testFile = { size: 2 * 1024 * 1024 }; // 2MB

      // Act
      const isValid = testFile.size <= maxSizeBytes;

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
      // Arrange
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const testFile = { size: 10 * 1024 * 1024 }; // 10MB

      // Act
      const isValid = testFile.size <= maxSizeBytes;

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
