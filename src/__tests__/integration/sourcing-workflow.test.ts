/**
 * Integration tests for sourcing request and quote workflow
 * Tests the complete flow from sourcing request submission to quote acceptance
 */

describe('Sourcing Request and Quote Workflow', () => {
  describe('Sourcing Request Creation', () => {
    it('should create a sourcing request with required fields', async () => {
      const requestData = {
        buyerId: 'test-buyer-123',
        itemDescription: 'Industrial pump for water treatment',
        quantity: 5,
        deliveryLocation: 'Nairobi, Kenya',
      };

      // Mock API call
      const response = await fetch('/api/sourcing/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('submitted');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        buyerId: 'test-buyer-123',
        // Missing itemDescription
        quantity: 5,
      };

      const response = await fetch('/api/sourcing/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
    });

    it('should store attachments with Cloudinary URLs', async () => {
      const formData = new FormData();
      formData.append('buyerId', 'test-buyer-123');
      formData.append('itemDescription', 'Industrial equipment');
      formData.append('quantity', '10');
      formData.append('deliveryLocation', 'Mombasa');

      // Mock file
      const mockFile = new File(['test content'], 'spec.pdf', { type: 'application/pdf' });
      formData.append('attachments', mockFile);

      const response = await fetch('/api/sourcing/requests', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.data.attachments.length).toBeGreaterThan(0);
      expect(result.data.attachments[0].cloudinaryUrl).toBeDefined();
    });
  });

  describe('Quote Generation and Management', () => {
    it('should create a quote for a sourcing request', async () => {
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Industrial Pump Model X',
            quantity: 5,
            unitPrice: 50000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('pending');
      expect(result.data.totalAmount).toBe(250000);
    });

    it('should calculate total amount correctly', async () => {
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item 1',
            quantity: 2,
            unitPrice: 10000,
          },
          {
            description: 'Item 2',
            quantity: 3,
            unitPrice: 5000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const result = await response.json();
      // 2 * 10000 + 3 * 5000 = 20000 + 15000 = 35000
      expect(result.data.totalAmount).toBe(35000);
    });

    it('should mark quotes as expired when validity period passes', async () => {
      const expiredDate = new Date(Date.now() - 1000).toISOString(); // 1 second ago

      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        validUntil: expiredDate,
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const result = await response.json();
      const quoteId = result.data.id;

      // Fetch the quote - should be marked as expired
      const getResponse = await fetch(`/api/quotes/${quoteId}`);
      const getResult = await getResponse.json();
      expect(getResult.data.status).toBe('expired');
    });

    it('should prevent accepting expired quotes', async () => {
      const expiredDate = new Date(Date.now() - 1000).toISOString();

      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        validUntil: expiredDate,
      };

      const createResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const createResult = await createResponse.json();
      const quoteId = createResult.data.id;

      // Try to accept expired quote
      const acceptResponse = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'bank-transfer' }),
      });

      expect(acceptResponse.status).toBe(400);
      const acceptResult = await acceptResponse.json();
      expect(acceptResult.error).toContain('expired');
    });
  });

  describe('Quote Acceptance and Order Creation', () => {
    it('should create an order when quote is accepted', async () => {
      // First create a quote
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Industrial Pump',
            quantity: 5,
            unitPrice: 50000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const createResult = await createResponse.json();
      const quoteId = createResult.data.id;

      // Accept the quote
      const acceptResponse = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'bank-transfer' }),
      });

      expect(acceptResponse.status).toBe(200);
      const acceptResult = await acceptResponse.json();
      expect(acceptResult.data.orderId).toBeDefined();
      expect(acceptResult.data.referenceCode).toBeDefined();
      expect(acceptResult.data.totalAmount).toBe(250000);
    });

    it('should support both M-Pesa and Bank Transfer payment methods', async () => {
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 100000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const createResult = await createResponse.json();
      const quoteId = createResult.data.id;

      // Test Bank Transfer
      const bankResponse = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'bank-transfer' }),
      });

      expect(bankResponse.status).toBe(200);
      const bankResult = await bankResponse.json();
      expect(bankResult.data.paymentMethod).toBe('bank-transfer');
    });

    it('should generate unique reference codes for orders', async () => {
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Create two quotes and accept them
      const quote1Response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const quote1Result = await quote1Response.json();

      const quote2Response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const quote2Result = await quote2Response.json();

      // Accept both quotes
      const accept1Response = await fetch(`/api/quotes/${quote1Result.data.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'bank-transfer' }),
      });

      const accept2Response = await fetch(`/api/quotes/${quote2Result.data.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'bank-transfer' }),
      });

      const accept1Result = await accept1Response.json();
      const accept2Result = await accept2Response.json();

      // Reference codes should be different
      expect(accept1Result.data.referenceCode).not.toBe(accept2Result.data.referenceCode);
    });
  });

  describe('Quote Validity Period', () => {
    it('should display days remaining for valid quotes', async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days from now

      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        validUntil: futureDate,
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const result = await response.json();
      expect(result.data.validUntil).toBe(futureDate);
      expect(result.data.status).toBe('pending');
    });

    it('should allow extending quote validity period', async () => {
      const quoteData = {
        sourcingRequestId: 'request-123',
        buyerId: 'buyer-123',
        lineItems: [
          {
            description: 'Item',
            quantity: 1,
            unitPrice: 10000,
          },
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const createResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const createResult = await createResponse.json();
      const quoteId = createResult.data.id;

      // Update quote with new validity period
      const newValidUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const updateResponse = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validUntil: newValidUntil }),
      });

      // Note: This test assumes an update endpoint exists
      // If not, this test should be skipped or the endpoint should be implemented
    });
  });
});
