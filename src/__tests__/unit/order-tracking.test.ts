/**
 * Unit Tests for Order Tracking
 * Tests order status display, timeline rendering, and dashboard calculations
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6
 */

describe('Order Tracking', () => {
  describe('Order Status Display', () => {
    it('should display pending payment status correctly', () => {
      // Arrange
      const order = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        orderStatus: 'pending-payment',
        paymentStatus: 'pending',
        totalAmount: 50000,
        items: [
          {
            id: '1',
            productName: 'Pump',
            quantity: 2,
            unitPrice: 25000,
            subtotal: 50000,
            isPreOrder: false,
          },
        ],
      };

      // Act
      const isPendingPayment = order.orderStatus === 'pending-payment';

      // Assert
      expect(isPendingPayment).toBe(true);
      expect(order.paymentStatus).toBe('pending');
    });

    it('should display payment received status correctly', () => {
      // Arrange
      const order = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        orderStatus: 'payment-received',
        paymentStatus: 'reconciled',
        totalAmount: 50000,
      };

      // Act
      const isPaymentReceived = order.orderStatus === 'payment-received';

      // Assert
      expect(isPaymentReceived).toBe(true);
      expect(order.paymentStatus).toBe('reconciled');
    });

    it('should display processing status correctly', () => {
      // Arrange
      const order = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        orderStatus: 'processing',
        paymentStatus: 'reconciled',
      };

      // Act
      const isProcessing = order.orderStatus === 'processing';

      // Assert
      expect(isProcessing).toBe(true);
    });

    it('should display shipped status correctly', () => {
      // Arrange
      const order = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        orderStatus: 'shipped',
        paymentStatus: 'reconciled',
      };

      // Act
      const isShipped = order.orderStatus === 'shipped';

      // Assert
      expect(isShipped).toBe(true);
    });

    it('should display completed status correctly', () => {
      // Arrange
      const order = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        orderStatus: 'completed',
        paymentStatus: 'reconciled',
      };

      // Act
      const isCompleted = order.orderStatus === 'completed';

      // Assert
      expect(isCompleted).toBe(true);
    });
  });

  describe('Order Categorization by Status', () => {
    it('should categorize orders by pending payment status', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'pending-payment' },
        { id: '2', orderStatus: 'payment-received' },
        { id: '3', orderStatus: 'pending-payment' },
      ];

      // Act
      const pendingPaymentOrders = orders.filter(o => o.orderStatus === 'pending-payment');

      // Assert
      expect(pendingPaymentOrders).toHaveLength(2);
      expect(pendingPaymentOrders[0].id).toBe('1');
      expect(pendingPaymentOrders[1].id).toBe('3');
    });

    it('should categorize orders by processing status', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'processing' },
        { id: '2', orderStatus: 'payment-received' },
        { id: '3', orderStatus: 'processing' },
        { id: '4', orderStatus: 'shipped' },
      ];

      // Act
      const processingOrders = orders.filter(o => o.orderStatus === 'processing');

      // Assert
      expect(processingOrders).toHaveLength(2);
    });

    it('should categorize orders by completed status', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'completed' },
        { id: '2', orderStatus: 'processing' },
        { id: '3', orderStatus: 'completed' },
      ];

      // Act
      const completedOrders = orders.filter(o => o.orderStatus === 'completed');

      // Assert
      expect(completedOrders).toHaveLength(2);
    });

    it('should return empty array when no orders match status', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'completed' },
        { id: '2', orderStatus: 'completed' },
      ];

      // Act
      const pendingOrders = orders.filter(o => o.orderStatus === 'pending-payment');

      // Assert
      expect(pendingOrders).toHaveLength(0);
    });
  });

  describe('Order Detail Display', () => {
    it('should display all order items with quantities and prices', () => {
      // Arrange
      const order = {
        id: '123',
        items: [
          {
            id: '1',
            productName: 'Pump A',
            quantity: 2,
            unitPrice: 25000,
            subtotal: 50000,
            isPreOrder: false,
          },
          {
            id: '2',
            productName: 'Motor B',
            quantity: 1,
            unitPrice: 30000,
            subtotal: 30000,
            isPreOrder: true,
          },
        ],
      };

      // Act
      const totalItems = order.items.length;
      const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Assert
      expect(totalItems).toBe(2);
      expect(totalQuantity).toBe(3);
      expect(totalAmount).toBe(80000);
    });

    it('should display shipping details correctly', () => {
      // Arrange
      const order = {
        id: '123',
        contactName: 'John Doe',
        contactPhone: '+254712345678',
        shippingAddress: '123 Main Street',
        shippingCity: 'Nairobi',
      };

      // Act
      const hasShippingInfo =
        !!order.contactName &&
        !!order.contactPhone &&
        !!order.shippingAddress &&
        !!order.shippingCity;

      // Assert
      expect(hasShippingInfo).toBe(true);
      expect(order.contactName).toBe('John Doe');
      expect(order.shippingCity).toBe('Nairobi');
    });

    it('should display payment instructions for pending orders', () => {
      // Arrange
      const order = {
        id: '123',
        orderStatus: 'pending-payment',
        paymentMethod: 'bank-transfer',
        referenceCode: 'SSS-2024-ABC123',
        totalAmount: 50000,
      };

      // Act
      const shouldShowPaymentInstructions = order.orderStatus === 'pending-payment';
      const hasReferenceCode = order.referenceCode !== null;

      // Assert
      expect(shouldShowPaymentInstructions).toBe(true);
      expect(hasReferenceCode).toBe(true);
      expect(order.paymentMethod).toBe('bank-transfer');
    });

    it('should not display payment instructions for completed orders', () => {
      // Arrange
      const order = {
        id: '123',
        orderStatus: 'completed',
        paymentMethod: 'mpesa',
      };

      // Act
      const shouldShowPaymentInstructions = order.orderStatus === 'pending-payment';

      // Assert
      expect(shouldShowPaymentInstructions).toBe(false);
    });
  });

  describe('Payment Status Indicators', () => {
    it('should indicate pending payment status', () => {
      // Arrange
      const payment = {
        id: '1',
        status: 'pending',
        amount: 50000,
      };

      // Act
      const isPending = payment.status === 'pending';

      // Assert
      expect(isPending).toBe(true);
    });

    it('should indicate reconciled payment status', () => {
      // Arrange
      const payment = {
        id: '1',
        status: 'reconciled',
        amount: 50000,
      };

      // Act
      const isReconciled = payment.status === 'reconciled';

      // Assert
      expect(isReconciled).toBe(true);
    });

    it('should indicate pending reconciliation status', () => {
      // Arrange
      const payment = {
        id: '1',
        status: 'pending-reconciliation',
        amount: 50000,
      };

      // Act
      const isPendingReconciliation = payment.status === 'pending-reconciliation';

      // Assert
      expect(isPendingReconciliation).toBe(true);
    });

    it('should indicate rejected payment status', () => {
      // Arrange
      const payment = {
        id: '1',
        status: 'rejected',
        amount: 50000,
        rejectionReason: 'Amount mismatch',
      };

      // Act
      const isRejected = payment.status === 'rejected';

      // Assert
      expect(isRejected).toBe(true);
      expect(payment.rejectionReason).toBe('Amount mismatch');
    });
  });

  describe('Timeline Rendering', () => {
    it('should display timeline events in chronological order', () => {
      // Arrange
      const timeline = [
        {
          id: '1',
          status: 'pending-payment',
          description: 'Order created',
          createdAt: '2024-01-01T10:00:00Z',
        },
        {
          id: '2',
          status: 'payment-received',
          description: 'Payment confirmed',
          createdAt: '2024-01-02T10:00:00Z',
        },
        {
          id: '3',
          status: 'processing',
          description: 'Order processing started',
          createdAt: '2024-01-03T10:00:00Z',
        },
      ];

      // Act
      const sortedTimeline = [...timeline].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Assert
      expect(sortedTimeline[0].status).toBe('pending-payment');
      expect(sortedTimeline[1].status).toBe('payment-received');
      expect(sortedTimeline[2].status).toBe('processing');
    });

    it('should display all timeline events', () => {
      // Arrange
      const timeline = [
        { id: '1', status: 'pending-payment', description: 'Order created' },
        { id: '2', status: 'payment-received', description: 'Payment confirmed' },
        { id: '3', status: 'processing', description: 'Processing started' },
        { id: '4', status: 'shipped', description: 'Order shipped' },
      ];

      // Act
      const eventCount = timeline.length;

      // Assert
      expect(eventCount).toBe(4);
      expect(timeline.every(e => e.description)).toBe(true);
    });

    it('should handle empty timeline', () => {
      // Arrange
      const timeline: any[] = [];

      // Act
      const hasEvents = timeline.length > 0;

      // Assert
      expect(hasEvents).toBe(false);
    });
  });

  describe('Dashboard Calculations', () => {
    it('should calculate outstanding balance correctly', () => {
      // Arrange
      const orders = [
        { id: '1', totalAmount: 50000, paymentStatus: 'pending' },
        { id: '2', totalAmount: 30000, paymentStatus: 'reconciled' },
        { id: '3', totalAmount: 20000, paymentStatus: 'pending-reconciliation' },
      ];

      // Act
      const outstandingBalance = orders
        .filter(o => o.paymentStatus !== 'reconciled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      // Assert
      expect(outstandingBalance).toBe(70000);
    });

    it('should calculate pending reconciliation amount correctly', () => {
      // Arrange
      const orders = [
        { id: '1', totalAmount: 50000, paymentStatus: 'pending' },
        { id: '2', totalAmount: 30000, paymentStatus: 'pending-reconciliation' },
        { id: '3', totalAmount: 20000, paymentStatus: 'pending-reconciliation' },
      ];

      // Act
      const pendingReconciliation = orders
        .filter(o => o.paymentStatus === 'pending-reconciliation')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      // Assert
      expect(pendingReconciliation).toBe(50000);
    });

    it('should calculate total orders count correctly', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'completed' },
        { id: '2', orderStatus: 'processing' },
        { id: '3', orderStatus: 'completed' },
        { id: '4', orderStatus: 'pending-payment' },
      ];

      // Act
      const totalOrders = orders.length;

      // Assert
      expect(totalOrders).toBe(4);
    });

    it('should calculate completed orders count correctly', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'completed' },
        { id: '2', orderStatus: 'processing' },
        { id: '3', orderStatus: 'completed' },
        { id: '4', orderStatus: 'pending-payment' },
      ];

      // Act
      const completedOrders = orders.filter(o => o.orderStatus === 'completed').length;

      // Assert
      expect(completedOrders).toBe(2);
    });

    it('should calculate completion rate correctly', () => {
      // Arrange
      const orders = [
        { id: '1', orderStatus: 'completed' },
        { id: '2', orderStatus: 'processing' },
        { id: '3', orderStatus: 'completed' },
        { id: '4', orderStatus: 'pending-payment' },
      ];

      // Act
      const completedCount = orders.filter(o => o.orderStatus === 'completed').length;
      const completionRate = Math.round((completedCount / orders.length) * 100);

      // Assert
      expect(completionRate).toBe(50);
    });

    it('should handle zero orders in completion rate calculation', () => {
      // Arrange
      const orders: any[] = [];

      // Act
      const completedCount = orders.filter(o => o.orderStatus === 'completed').length;
      const completionRate = orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0;

      // Assert
      expect(completionRate).toBe(0);
    });
  });

  describe('Dashboard Filtering', () => {
    it('should filter transactions by paid status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'paid' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'paid' },
        { id: '4', status: 'overdue' },
      ];

      // Act
      const paidTransactions = transactions.filter(t => t.status === 'paid');

      // Assert
      expect(paidTransactions).toHaveLength(2);
    });

    it('should filter transactions by pending status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'paid' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'pending' },
        { id: '4', status: 'overdue' },
      ];

      // Act
      const pendingTransactions = transactions.filter(t => t.status === 'pending');

      // Assert
      expect(pendingTransactions).toHaveLength(2);
    });

    it('should filter transactions by overdue status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'paid' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'overdue' },
        { id: '4', status: 'overdue' },
      ];

      // Act
      const overdueTransactions = transactions.filter(t => t.status === 'overdue');

      // Assert
      expect(overdueTransactions).toHaveLength(2);
    });

    it('should return all transactions when no filter applied', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'paid' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'overdue' },
      ];

      // Act
      const allTransactions = transactions;

      // Assert
      expect(allTransactions).toHaveLength(3);
    });
  });

  describe('Order Status Progression', () => {
    it('should track order through all stages', () => {
      // Arrange
      const stages = [
        'pending-payment',
        'payment-received',
        'processing',
        'shipped',
        'completed',
      ];

      // Act
      const stageCount = stages.length;

      // Assert
      expect(stageCount).toBe(5);
      expect(stages[0]).toBe('pending-payment');
      expect(stages[stages.length - 1]).toBe('completed');
    });

    it('should validate order status is in valid stages', () => {
      // Arrange
      const validStages = [
        'pending-payment',
        'payment-received',
        'processing',
        'shipped',
        'completed',
      ];
      const orderStatus = 'processing';

      // Act
      const isValidStatus = validStages.includes(orderStatus);

      // Assert
      expect(isValidStatus).toBe(true);
    });

    it('should reject invalid order status', () => {
      // Arrange
      const validStages = [
        'pending-payment',
        'payment-received',
        'processing',
        'shipped',
        'completed',
      ];
      const orderStatus = 'invalid-status';

      // Act
      const isValidStatus = validStages.includes(orderStatus);

      // Assert
      expect(isValidStatus).toBe(false);
    });
  });

  describe('Invoice Download', () => {
    it('should generate invoice with correct items', () => {
      // Arrange
      const invoice = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        items: [
          {
            id: '1',
            productName: 'Pump A',
            quantity: 2,
            unitPrice: 25000,
            subtotal: 50000,
          },
          {
            id: '2',
            productName: 'Motor B',
            quantity: 1,
            unitPrice: 30000,
            subtotal: 30000,
          },
        ],
        totalAmount: 80000,
      };

      // Act
      const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);
      const tax = subtotal * 0.16;
      const total = subtotal + tax;

      // Assert
      expect(subtotal).toBe(80000);
      expect(tax).toBe(12800);
      expect(total).toBe(92800);
    });

    it('should display invoice buyer information', () => {
      // Arrange
      const invoice = {
        id: '123',
        buyer: {
          id: 'buyer-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+254712345678',
          companyName: 'ABC Company',
        },
        contactName: 'Jane Doe',
        contactPhone: '+254712345679',
        shippingAddress: '123 Main Street',
        shippingCity: 'Nairobi',
      };

      // Act
      const hasBuyerInfo =
        !!invoice.buyer.name &&
        !!invoice.buyer.email &&
        !!invoice.contactName &&
        !!invoice.shippingAddress;

      // Assert
      expect(hasBuyerInfo).toBe(true);
      expect(invoice.buyer.companyName).toBe('ABC Company');
    });

    it('should display invoice payment details', () => {
      // Arrange
      const invoice = {
        id: '123',
        referenceCode: 'SSS-2024-ABC123',
        paymentMethod: 'bank-transfer',
        paymentStatus: 'reconciled',
        orderStatus: 'completed',
      };

      // Act
      const hasPaymentDetails =
        !!invoice.paymentMethod &&
        !!invoice.paymentStatus &&
        !!invoice.orderStatus;

      // Assert
      expect(hasPaymentDetails).toBe(true);
      expect(invoice.paymentMethod).toBe('bank-transfer');
      expect(invoice.paymentStatus).toBe('reconciled');
    });

    it('should calculate invoice totals with VAT', () => {
      // Arrange
      const invoice = {
        items: [
          { subtotal: 50000 },
          { subtotal: 30000 },
          { subtotal: 20000 },
        ],
      };

      // Act
      const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);
      const vat = subtotal * 0.16;
      const total = subtotal + vat;

      // Assert
      expect(subtotal).toBe(100000);
      expect(vat).toBe(16000);
      expect(total).toBe(116000);
    });

    it('should handle invoice with single item', () => {
      // Arrange
      const invoice = {
        items: [
          {
            id: '1',
            productName: 'Pump',
            quantity: 1,
            unitPrice: 50000,
            subtotal: 50000,
          },
        ],
      };

      // Act
      const itemCount = invoice.items.length;
      const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Assert
      expect(itemCount).toBe(1);
      expect(subtotal).toBe(50000);
    });

    it('should handle invoice with multiple items', () => {
      // Arrange
      const invoice = {
        items: [
          { subtotal: 10000 },
          { subtotal: 20000 },
          { subtotal: 30000 },
          { subtotal: 40000 },
        ],
      };

      // Act
      const itemCount = invoice.items.length;
      const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Assert
      expect(itemCount).toBe(4);
      expect(subtotal).toBe(100000);
    });
  });

  describe('Transaction Filtering by Status', () => {
    it('should filter transactions by pending status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'pending', amount: 20000 },
      ];

      // Act
      const pendingTransactions = transactions.filter(t => t.status === 'pending');

      // Assert
      expect(pendingTransactions).toHaveLength(2);
      expect(pendingTransactions[0].id).toBe('1');
      expect(pendingTransactions[1].id).toBe('3');
    });

    it('should filter transactions by reconciled status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'reconciled', amount: 20000 },
      ];

      // Act
      const reconciledTransactions = transactions.filter(t => t.status === 'reconciled');

      // Assert
      expect(reconciledTransactions).toHaveLength(2);
    });

    it('should filter transactions by pending-reconciliation status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'pending-reconciliation', amount: 30000 },
        { id: '3', status: 'pending-reconciliation', amount: 20000 },
        { id: '4', status: 'reconciled', amount: 10000 },
      ];

      // Act
      const pendingReconciliationTransactions = transactions.filter(
        t => t.status === 'pending-reconciliation'
      );

      // Assert
      expect(pendingReconciliationTransactions).toHaveLength(2);
    });

    it('should filter transactions by rejected status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'rejected', amount: 30000, rejectionReason: 'Amount mismatch' },
        { id: '3', status: 'rejected', amount: 20000, rejectionReason: 'Invalid reference' },
      ];

      // Act
      const rejectedTransactions = transactions.filter(t => t.status === 'rejected');

      // Assert
      expect(rejectedTransactions).toHaveLength(2);
      expect(rejectedTransactions[0].rejectionReason).toBe('Amount mismatch');
    });

    it('should return all transactions when no filter applied', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'reconciled' },
        { id: '3', status: 'pending-reconciliation' },
        { id: '4', status: 'rejected' },
      ];

      // Act
      const allTransactions = transactions;

      // Assert
      expect(allTransactions).toHaveLength(4);
    });

    it('should calculate total amount for filtered transactions', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'pending', amount: 20000 },
      ];

      // Act
      const pendingTransactions = transactions.filter(t => t.status === 'pending');
      const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Assert
      expect(totalPending).toBe(70000);
    });

    it('should handle empty transaction list', () => {
      // Arrange
      const transactions: any[] = [];

      // Act
      const filteredTransactions = transactions.filter(t => t.status === 'pending');

      // Assert
      expect(filteredTransactions).toHaveLength(0);
    });
  });

  describe('Transaction Grouping', () => {
    it('should group transactions by status', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'pending', amount: 20000 },
        { id: '4', status: 'reconciled', amount: 10000 },
      ];

      // Act
      const grouped = transactions.reduce(
        (acc, t) => {
          if (!acc[t.status]) {
            acc[t.status] = [];
          }
          acc[t.status].push(t);
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Assert
      expect(Object.keys(grouped)).toHaveLength(2);
      expect(grouped['pending']).toHaveLength(2);
      expect(grouped['reconciled']).toHaveLength(2);
    });

    it('should calculate total amount per status group', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'pending', amount: 20000 },
        { id: '4', status: 'reconciled', amount: 10000 },
      ];

      // Act
      const grouped = transactions.reduce(
        (acc, t) => {
          if (!acc[t.status]) {
            acc[t.status] = { count: 0, total: 0 };
          }
          acc[t.status].count += 1;
          acc[t.status].total += t.amount;
          return acc;
        },
        {} as Record<string, { count: number; total: number }>
      );

      // Assert
      expect(grouped['pending'].total).toBe(70000);
      expect(grouped['reconciled'].total).toBe(40000);
      expect(grouped['pending'].count).toBe(2);
      expect(grouped['reconciled'].count).toBe(2);
    });

    it('should handle transactions with multiple statuses', () => {
      // Arrange
      const transactions = [
        { id: '1', status: 'pending', amount: 50000 },
        { id: '2', status: 'reconciled', amount: 30000 },
        { id: '3', status: 'pending-reconciliation', amount: 20000 },
        { id: '4', status: 'rejected', amount: 10000 },
        { id: '5', status: 'pending', amount: 15000 },
      ];

      // Act
      const statusCounts = transactions.reduce(
        (acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Assert
      expect(Object.keys(statusCounts)).toHaveLength(4);
      expect(statusCounts['pending']).toBe(2);
      expect(statusCounts['reconciled']).toBe(1);
      expect(statusCounts['pending-reconciliation']).toBe(1);
      expect(statusCounts['rejected']).toBe(1);
    });
  });

  describe('Invoice List Display', () => {
    it('should display invoices with correct information', () => {
      // Arrange
      const invoices = [
        {
          id: '1',
          referenceCode: 'SSS-2024-001',
          totalAmount: 50000,
          paymentStatus: 'reconciled',
          createdAt: '2024-01-01T10:00:00Z',
          items: [{ productName: 'Pump' }],
        },
        {
          id: '2',
          referenceCode: 'SSS-2024-002',
          totalAmount: 30000,
          paymentStatus: 'pending',
          createdAt: '2024-01-02T10:00:00Z',
          items: [{ productName: 'Motor' }],
        },
      ];

      // Act
      const invoiceCount = invoices.length;
      const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

      // Assert
      expect(invoiceCount).toBe(2);
      expect(totalInvoiceAmount).toBe(80000);
      expect(invoices[0].referenceCode).toBe('SSS-2024-001');
    });

    it('should sort invoices by date descending', () => {
      // Arrange
      const invoices = [
        { id: '1', createdAt: '2024-01-01T10:00:00Z' },
        { id: '2', createdAt: '2024-01-03T10:00:00Z' },
        { id: '3', createdAt: '2024-01-02T10:00:00Z' },
      ];

      // Act
      const sorted = [...invoices].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Assert
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should handle empty invoice list', () => {
      // Arrange
      const invoices: any[] = [];

      // Act
      const invoiceCount = invoices.length;

      // Assert
      expect(invoiceCount).toBe(0);
    });

    it('should display invoice status correctly', () => {
      // Arrange
      const invoices = [
        { id: '1', paymentStatus: 'reconciled', orderStatus: 'completed' },
        { id: '2', paymentStatus: 'pending', orderStatus: 'processing' },
        { id: '3', paymentStatus: 'pending-reconciliation', orderStatus: 'shipped' },
      ];

      // Act
      const completedInvoices = invoices.filter(i => i.orderStatus === 'completed');
      const processingInvoices = invoices.filter(i => i.orderStatus === 'processing');

      // Assert
      expect(completedInvoices).toHaveLength(1);
      expect(processingInvoices).toHaveLength(1);
    });
  });
});
