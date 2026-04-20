import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  createInvoice,
  getInvoiceById,
  updateInvoiceStatus,
  sendInvoice,
  markInvoiceAsPaid,
  addLogisticsNotes,
  addAdminComments,
} from '@/lib/database/queries/invoices';
import { Invoice } from '@/types';

describe('Invoice Management', () => {
  let testInvoiceId: string;
  const testBuyerId = 'test-buyer-id';

  describe('Invoice Creation', () => {
    it('should create an invoice with line items', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Industrial Pump',
            specifications: 'High-pressure pump',
            quantity: 2,
            unitPrice: 50000,
          },
          {
            description: 'Installation Service',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        subtotal: 110000,
        taxAmount: 17600,
        totalAmount: 127600,
        termsAndConditions: 'Payment due within 30 days',
        paymentInstructions: 'Bank transfer to account XXX',
        settlementInstructions: 'Settlement via bank transfer',
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice).toBeDefined();
      expect(invoice.invoiceNumber).toMatch(/^INV-\d{6}-\d{4}$/);
      expect(invoice.status).toBe('draft');
      expect(invoice.subtotal).toBe(110000);
      expect(invoice.taxAmount).toBe(17600);
      expect(invoice.totalAmount).toBe(127600);
      expect(invoice.lineItems).toHaveLength(2);
      expect(invoice.lineItems[0].description).toBe('Industrial Pump');
      expect(invoice.lineItems[0].subtotal).toBe(100000);

      testInvoiceId = invoice.id;
    });

    it('should calculate line item subtotals correctly', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Product A',
            quantity: 5,
            unitPrice: 1000,
          },
        ],
        subtotal: 5000,
        taxAmount: 800,
        totalAmount: 5800,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.lineItems[0].subtotal).toBe(5000);
      expect(invoice.lineItems[0].quantity * invoice.lineItems[0].unitPrice).toBe(5000);
    });
  });

  describe('Invoice Retrieval', () => {
    it('should retrieve an invoice by ID', async () => {
      const invoice = await getInvoiceById(testInvoiceId);

      expect(invoice).toBeDefined();
      expect(invoice?.id).toBe(testInvoiceId);
      expect(invoice?.status).toBe('draft');
      expect(invoice?.lineItems.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent invoice', async () => {
      const invoice = await getInvoiceById('non-existent-id');

      expect(invoice).toBeNull();
    });

    it('should include all invoice details', async () => {
      const invoice = await getInvoiceById(testInvoiceId);

      expect(invoice?.invoiceNumber).toBeDefined();
      expect(invoice?.buyerId).toBe(testBuyerId);
      expect(invoice?.status).toBeDefined();
      expect(invoice?.subtotal).toBeGreaterThan(0);
      expect(invoice?.totalAmount).toBeGreaterThan(0);
      expect(invoice?.createdAt).toBeDefined();
      expect(invoice?.updatedAt).toBeDefined();
    });
  });

  describe('Invoice Status Management', () => {
    it('should update invoice status to sent', async () => {
      const updated = await sendInvoice(testInvoiceId);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('sent');
      expect(updated?.sentAt).toBeDefined();
    });

    it('should update invoice status to paid', async () => {
      const updated = await markInvoiceAsPaid(testInvoiceId);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('paid');
      expect(updated?.paidAt).toBeDefined();
    });

    it('should update invoice status to pending-payment', async () => {
      const updated = await updateInvoiceStatus(testInvoiceId, 'pending-payment');

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('pending-payment');
    });

    it('should return null when updating non-existent invoice', async () => {
      const updated = await updateInvoiceStatus('non-existent-id', 'paid');

      expect(updated).toBeNull();
    });
  });

  describe('Invoice Notes and Comments', () => {
    it('should add logistics notes to invoice', async () => {
      const notes = 'Delivery to warehouse on 2024-01-15. Contact: John Doe';
      const updated = await addLogisticsNotes(testInvoiceId, notes);

      expect(updated).toBeDefined();
      expect(updated?.logisticsNotes).toBe(notes);
    });

    it('should add admin comments to invoice', async () => {
      const comments = 'Customer requested expedited delivery. Approved.';
      const updated = await addAdminComments(testInvoiceId, comments);

      expect(updated).toBeDefined();
      expect(updated?.adminComments).toBe(comments);
    });

    it('should preserve existing notes when adding comments', async () => {
      const notes = 'Delivery notes';
      await addLogisticsNotes(testInvoiceId, notes);

      const comments = 'Admin comments';
      const updated = await addAdminComments(testInvoiceId, comments);

      expect(updated?.logisticsNotes).toBe(notes);
      expect(updated?.adminComments).toBe(comments);
    });
  });

  describe('Invoice Calculations', () => {
    it('should calculate correct totals with tax', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item 1',
            quantity: 10,
            unitPrice: 1000,
          },
          {
            description: 'Item 2',
            quantity: 5,
            unitPrice: 2000,
          },
        ],
        subtotal: 20000,
        taxAmount: 3200,
        totalAmount: 23200,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.subtotal).toBe(20000);
      expect(invoice.taxAmount).toBe(3200);
      expect(invoice.totalAmount).toBe(23200);
      expect(invoice.subtotal + invoice.taxAmount).toBe(invoice.totalAmount);
    });

    it('should handle invoices with zero tax', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
        subtotal: 1000,
        taxAmount: 0,
        totalAmount: 1000,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.taxAmount).toBe(0);
      expect(invoice.totalAmount).toBe(1000);
    });
  });

  describe('Invoice Line Items', () => {
    it('should store multiple line items', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Product A',
            specifications: 'Spec A',
            quantity: 2,
            unitPrice: 5000,
          },
          {
            description: 'Product B',
            specifications: 'Spec B',
            quantity: 3,
            unitPrice: 3000,
          },
          {
            description: 'Service',
            quantity: 1,
            unitPrice: 2000,
          },
        ],
        subtotal: 19000,
        taxAmount: 3040,
        totalAmount: 22040,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.lineItems).toHaveLength(3);
      expect(invoice.lineItems[0].description).toBe('Product A');
      expect(invoice.lineItems[1].description).toBe('Product B');
      expect(invoice.lineItems[2].description).toBe('Service');
    });

    it('should calculate line item subtotals correctly', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 10,
            unitPrice: 500,
          },
        ],
        subtotal: 5000,
        taxAmount: 800,
        totalAmount: 5800,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.lineItems[0].subtotal).toBe(5000);
    });
  });

  describe('Invoice Metadata', () => {
    it('should include buyer information', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
        subtotal: 1000,
        taxAmount: 160,
        totalAmount: 1160,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.buyerId).toBe(testBuyerId);
    });

    it('should include timestamps', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
        subtotal: 1000,
        taxAmount: 160,
        totalAmount: 1160,
      };

      const invoice = await createInvoice(testBuyerId, invoiceData);

      expect(invoice.createdAt).toBeDefined();
      expect(invoice.updatedAt).toBeDefined();
      expect(new Date(invoice.createdAt).getTime()).toBeGreaterThan(0);
    });

    it('should generate unique invoice numbers', async () => {
      const invoiceData = {
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
        subtotal: 1000,
        taxAmount: 160,
        totalAmount: 1160,
      };

      const invoice1 = await createInvoice(testBuyerId, invoiceData);
      const invoice2 = await createInvoice(testBuyerId, invoiceData);

      expect(invoice1.invoiceNumber).not.toBe(invoice2.invoiceNumber);
    });
  });
});
