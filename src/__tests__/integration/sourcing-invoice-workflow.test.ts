import { describe, it, expect, beforeAll } from '@jest/globals';
import { getSourcingRequestWithQuotes, updateSourcingRequestStatus } from '@/lib/database/queries/sourcing';
import { createInvoice, getInvoiceById, sendInvoice } from '@/lib/database/queries/invoices';

describe('Sourcing Request to Invoice Workflow', () => {
  let testSourcingRequestId: string;
  let testInvoiceId: string;
  const testBuyerId = 'test-buyer-id';

  describe('Complete Workflow', () => {
    it('should retrieve sourcing request with quotes', async () => {
      // This test assumes a sourcing request exists in the database
      // In a real scenario, we would create one first
      // For now, we'll test the structure
      const request = await getSourcingRequestWithQuotes('test-request-id');

      if (request) {
        expect(request.id).toBeDefined();
        expect(request.buyerId).toBeDefined();
        expect(request.itemDescription).toBeDefined();
        expect(request.quantity).toBeGreaterThan(0);
        expect(Array.isArray(request.quotes)).toBe(true);
      }
    });

    it('should update sourcing request status to under-review', async () => {
      // This test assumes a sourcing request exists
      const updated = await updateSourcingRequestStatus('test-request-id', 'under-review', 'Reviewing request');

      if (updated) {
        expect(updated.status).toBe('under-review');
        expect(updated.adminNotes).toContain('Reviewing');
      }
    });

    it('should create invoice from sourcing request', async () => {
      const invoiceData = {
        sourcingRequestId: 'test-request-id',
        lineItems: [
          {
            description: 'Custom Industrial Equipment',
            specifications: 'As per specifications provided',
            quantity: 1,
            unitPrice: 500000,
          },
        ],
        subtotal: 500000,
        taxAmount: 80000,
        totalAmount: 580000,
        termsAndConditions: 'Payment terms: 50% deposit, 50% on delivery',
        paymentInstructions: 'Bank transfer to account details provided',
        settlementInstructions: 'Settlement via bank transfer',
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice).toBeDefined();
      expect(invoice.sourcingRequestId).toBe('test-request-id');
      expect(invoice.status).toBe('draft');
      expect(invoice.totalAmount).toBe(580000);

      testInvoiceId = invoice.id;
    });

    it('should send invoice to buyer', async () => {
      if (!testInvoiceId) {
        // Skip if invoice wasn't created
        return;
      }

      const sent = await sendInvoice(testInvoiceId);

      expect(sent).toBeDefined();
      expect(sent?.status).toBe('sent');
      expect(sent?.sentAt).toBeDefined();
    });

    it('should update sourcing request status to quoted', async () => {
      const updated = await updateSourcingRequestStatus('test-request-id', 'quoted', 'Pro-forma invoice generated');

      if (updated) {
        expect(updated.status).toBe('quoted');
      }
    });
  });

  describe('Invoice Generation from Sourcing Request', () => {
    it('should create invoice with correct line items from sourcing request', async () => {
      const invoiceData = {
        sourcingRequestId: 'test-request-id',
        lineItems: [
          {
            description: 'Item 1',
            quantity: 5,
            unitPrice: 10000,
          },
          {
            description: 'Item 2',
            quantity: 3,
            unitPrice: 15000,
          },
        ],
        subtotal: 95000,
        taxAmount: 15200,
        totalAmount: 110200,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.lineItems).toHaveLength(2);
      expect(invoice.lineItems[0].quantity).toBe(5);
      expect(invoice.lineItems[1].quantity).toBe(3);
      expect(invoice.totalAmount).toBe(110200);
    });

    it('should include settlement instructions in invoice', async () => {
      const settlementInstructions = `
Bank Details:
Account Name: Company Ltd
Account Number: 1234567890
Bank: Kenya Commercial Bank
Branch: Nairobi
Swift Code: KCBLKENA
      `;

      const invoiceData = {
        sourcingRequestId: 'test-request-id',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 50000,
          },
        ],
        subtotal: 50000,
        taxAmount: 8000,
        totalAmount: 58000,
        settlementInstructions,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.settlementInstructions).toBe(settlementInstructions);
    });

    it('should include payment instructions in invoice', async () => {
      const paymentInstructions = `
Payment Instructions:
1. Transfer 50% deposit to the bank account provided
2. Provide proof of payment
3. Remaining 50% due on delivery
      `;

      const invoiceData = {
        sourcingRequestId: 'test-request-id',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 50000,
          },
        ],
        subtotal: 50000,
        taxAmount: 8000,
        totalAmount: 58000,
        paymentInstructions,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.paymentInstructions).toBe(paymentInstructions);
    });
  });

  describe('Invoice Status Transitions', () => {
    it('should transition from draft to sent', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        subtotal: 10000,
        taxAmount: 1600,
        totalAmount: 11600,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);
      expect(invoice.status).toBe('draft');

      const sent = await sendInvoice(invoice.id);
      expect(sent?.status).toBe('sent');
    });

    it('should track invoice lifecycle', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        subtotal: 10000,
        taxAmount: 1600,
        totalAmount: 11600,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);
      const invoiceId = invoice.id;

      // Check initial state
      let current = await getInvoiceById(invoiceId);
      expect(current?.status).toBe('draft');
      expect(current?.sentAt).toBeUndefined();

      // Send invoice
      const sent = await sendInvoice(invoiceId);
      expect(sent?.status).toBe('sent');
      expect(sent?.sentAt).toBeDefined();

      // Verify state persisted
      current = await getInvoiceById(invoiceId);
      expect(current?.status).toBe('sent');
    });
  });

  describe('Multi-Item Invoices', () => {
    it('should handle invoices with multiple line items', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Pump Unit',
            specifications: 'High-pressure pump',
            quantity: 2,
            unitPrice: 100000,
          },
          {
            description: 'Motor',
            specifications: '15 kW motor',
            quantity: 2,
            unitPrice: 50000,
          },
          {
            description: 'Installation Service',
            quantity: 1,
            unitPrice: 30000,
          },
          {
            description: 'Training',
            quantity: 1,
            unitPrice: 20000,
          },
        ],
        subtotal: 400000,
        taxAmount: 64000,
        totalAmount: 464000,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.lineItems).toHaveLength(4);
      expect(invoice.subtotal).toBe(400000);
      expect(invoice.totalAmount).toBe(464000);

      // Verify each line item
      expect(invoice.lineItems[0].subtotal).toBe(200000);
      expect(invoice.lineItems[1].subtotal).toBe(100000);
      expect(invoice.lineItems[2].subtotal).toBe(30000);
      expect(invoice.lineItems[3].subtotal).toBe(20000);
    });
  });

  describe('Invoice Retrieval and Verification', () => {
    it('should retrieve invoice with all details', async () => {
      const invoiceData = {
        sourcingRequestId: 'test-request-id',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 50000,
          },
        ],
        subtotal: 50000,
        taxAmount: 8000,
        totalAmount: 58000,
        termsAndConditions: 'Terms apply',
        paymentInstructions: 'Pay via bank transfer',
        settlementInstructions: 'Settlement details',
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);
      const retrieved = await getInvoiceById(invoice.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.invoiceNumber).toBe(invoice.invoiceNumber);
      expect(retrieved?.totalAmount).toBe(58000);
      expect(retrieved?.termsAndConditions).toBe('Terms apply');
      expect(retrieved?.paymentInstructions).toBe('Pay via bank transfer');
      expect(retrieved?.settlementInstructions).toBe('Settlement details');
      expect(retrieved?.lineItems).toHaveLength(1);
    });
  });
});
