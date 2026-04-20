import { getDashboardKPIs, getInventoryHealth, getDetailedInventoryReport } from '@/lib/database/queries/admin';

// Mock the database connection
jest.mock('@/lib/database/connection', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));

import { query } from '@/lib/database/connection';

describe('Admin Dashboard Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardKPIs', () => {
    it('should calculate outstanding transfers from bank transfer payments', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '500000' }] }); // outstanding
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '3' }] }); // pending reconciliations
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '5' }] }); // active sourcing
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '1000000' }] }); // daily volume
      mockQuery.mockResolvedValueOnce({ rows: [{ health_score: '85' }] }); // ledger health

      const kpis = await getDashboardKPIs();

      expect(kpis.outstandingTransfers).toBe(500000);
      expect(kpis.pendingReconciliations).toBe(3);
      expect(kpis.activeSourcingRequests).toBe(5);
      expect(kpis.dailyTransactionVolume).toBe(1000000);
      expect(kpis.ledgerHealthScore).toBe(85);
    });

    it('should return zero values when no data exists', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ health_score: '100' }] });

      const kpis = await getDashboardKPIs();

      expect(kpis.outstandingTransfers).toBe(0);
      expect(kpis.pendingReconciliations).toBe(0);
      expect(kpis.activeSourcingRequests).toBe(0);
      expect(kpis.dailyTransactionVolume).toBe(0);
      expect(kpis.ledgerHealthScore).toBe(100);
    });

    it('should calculate ledger health score as 100 when no payments exist', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '0' }] });
      mockQuery.mockResolvedValueOnce({ rows: [{ health_score: '100' }] });

      const kpis = await getDashboardKPIs();

      expect(kpis.ledgerHealthScore).toBe(100);
    });
  });

  describe('getInventoryHealth', () => {
    it('should calculate inventory health score correctly', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'Pump A', stock_level: 5, category: 'pumps-motors', price: '50000' },
          { id: '2', name: 'Pump B', stock_level: 8, category: 'pumps-motors', price: '60000' },
        ],
      }); // low stock
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '3', name: 'Motor A', category: 'pumps-motors', price: '100000' },
        ],
      }); // out of stock
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          { health_score: '75', total_products: '10', healthy_products: '7' },
        ],
      }); // health score

      const health = await getInventoryHealth();

      expect(health.healthScore).toBe(75);
      expect(health.lowStockItems).toHaveLength(2);
      expect(health.outOfStockItems).toHaveLength(1);
      expect(health.totalProducts).toBe(10);
      expect(health.healthyProducts).toBe(7);
    });

    it('should identify low stock items correctly', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'Low Stock Item', stock_level: 5, category: 'electrical', price: '25000' },
        ],
      });
      
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({ rows: [{ health_score: '90', total_products: '100', healthy_products: '90' }] });

      const health = await getInventoryHealth();

      expect(health.lowStockItems[0].stockLevel).toBe(5);
      expect(health.lowStockItems[0].name).toBe('Low Stock Item');
    });

    it('should identify out of stock items correctly', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [] });
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '1', name: 'Out of Stock Item', category: 'storage', price: '150000' },
        ],
      });
      
      mockQuery.mockResolvedValueOnce({ rows: [{ health_score: '95', total_products: '100', healthy_products: '95' }] });

      const health = await getInventoryHealth();

      expect(health.outOfStockItems[0].name).toBe('Out of Stock Item');
    });

    it('should return 100% health when all products are healthy', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({
        rows: [{ health_score: '100', total_products: '50', healthy_products: '50' }],
      });

      const health = await getInventoryHealth();

      expect(health.healthScore).toBe(100);
      expect(health.lowStockItems).toHaveLength(0);
      expect(health.outOfStockItems).toHaveLength(0);
    });
  });

  describe('getDetailedInventoryReport', () => {
    it('should return paginated inventory items', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '100' }] }); // count
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            name: 'Product 1',
            category: 'pumps-motors',
            stock_level: 15,
            price: '50000',
            availability: 'in-stock',
            needs_restocking: false,
          },
          {
            id: '2',
            name: 'Product 2',
            category: 'electrical',
            stock_level: 5,
            price: '25000',
            availability: 'in-stock',
            needs_restocking: true,
          },
        ],
      }); // items

      const report = await getDetailedInventoryReport(1, 50);

      expect(report.total).toBe(100);
      expect(report.items).toHaveLength(2);
      expect(report.items[0].needsRestocking).toBe(false);
      expect(report.items[1].needsRestocking).toBe(true);
    });

    it('should prioritize items needing restocking', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '50' }] });
      
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            name: 'Low Stock',
            category: 'pumps-motors',
            stock_level: 5,
            price: '50000',
            availability: 'in-stock',
            needs_restocking: true,
          },
          {
            id: '2',
            name: 'Healthy Stock',
            category: 'electrical',
            stock_level: 50,
            price: '25000',
            availability: 'in-stock',
            needs_restocking: false,
          },
        ],
      });

      const report = await getDetailedInventoryReport(1, 50);

      // Items needing restocking should come first
      expect(report.items[0].needsRestocking).toBe(true);
      expect(report.items[1].needsRestocking).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const mockQuery = query as jest.MockedFunction<typeof query>;
      
      mockQuery.mockResolvedValueOnce({ rows: [{ total: '150' }] });
      mockQuery.mockResolvedValueOnce({ rows: Array(50).fill({ id: '1', name: 'Product', category: 'pumps-motors', stock_level: 20, price: '50000', availability: 'in-stock', needs_restocking: false }) });

      const report = await getDetailedInventoryReport(2, 50);

      expect(report.total).toBe(150);
      expect(report.items).toHaveLength(50);
    });
  });
});
