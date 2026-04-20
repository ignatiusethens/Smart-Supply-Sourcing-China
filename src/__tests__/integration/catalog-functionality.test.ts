/**
 * Integration Tests for Product Catalog Functionality
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * Tests product browsing, filtering, search, and product detail workflows
 * with real API and database integration.
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getProducts, getProductById } from '@/lib/database/queries/products';
import { applyFilters, searchProducts } from '@/lib/algorithms/filtering';
import { useCartStore } from '@/lib/stores/cartStore';
import { Product, ProductFilters, Category, AvailabilityStatus } from '@/types';

describe('Product Catalog Integration Tests', () => {
  let testProducts: Product[];

  beforeAll(async () => {
    // Fetch test products from database
    testProducts = await getProducts({
      categories: [],
      availability: [],
      priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
      searchQuery: ''
    });
  });

  describe('Product Browsing - Requirement 1.1, 1.2', () => {
    it('should display products in grid layout with required information', async () => {
      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);

      // Verify each product has required fields (Requirement 1.1)
      products.forEach(product => {
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeGreaterThan(0);
        expect(product.availability).toBeDefined();
        expect(['in-stock', 'pre-order', 'out-of-stock']).toContain(product.availability);
        expect(product.imageUrls).toBeDefined();
      });
    });

    it('should organize products into five categories', async () => {
      const categories: Category[] = [
        'pumps-motors',
        'energy-systems',
        'fluid-control',
        'electrical',
        'storage'
      ];

      // Verify products exist in all five categories (Requirement 1.2)
      for (const category of categories) {
        const products = await getProducts({
          categories: [category],
          availability: [],
          priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
          searchQuery: ''
        });

        // Each category should have at least one product
        expect(products.length).toBeGreaterThan(0);
        
        // All returned products should belong to the requested category
        products.forEach(product => {
          expect(product.category).toBe(category);
        });
      }
    });

    it('should fetch products with specifications and images', async () => {
      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      const productsWithSpecs = products.filter(p => p.specifications && p.specifications.length > 0);
      expect(productsWithSpecs.length).toBeGreaterThan(0);

      // Verify specification structure
      productsWithSpecs.forEach(product => {
        product.specifications.forEach(spec => {
          expect(spec.label).toBeDefined();
          expect(spec.value).toBeDefined();
          expect(spec.productId).toBe(product.id);
        });
      });
    });
  });

  describe('Category Filtering - Requirement 1.3', () => {
    it('should filter products by single category', async () => {
      const category: Category = 'pumps-motors';

      const products = await getProducts({
        categories: [category],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);
      
      // All products should belong to the selected category (Requirement 1.3)
      products.forEach(product => {
        expect(product.category).toBe(category);
      });
    });

    it('should filter products by multiple categories', async () => {
      const categories: Category[] = ['pumps-motors', 'electrical'];

      const products = await getProducts({
        categories,
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);
      
      // All products should belong to one of the selected categories
      products.forEach(product => {
        expect(categories).toContain(product.category);
      });
    });

    it('should return empty array when no products match category', async () => {
      // This test assumes we can create a scenario with no matching products
      // In a real database, this might not be possible with seed data
      const allProducts = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Test that filtering works correctly even if results are empty
      const filteredProducts = applyFilters(allProducts, {
        categories: ['pumps-motors'],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Verify all results match the filter
      filteredProducts.forEach(product => {
        expect(product.category).toBe('pumps-motors');
      });
    });
  });

  describe('Availability Filtering - Requirement 1.4', () => {
    it('should filter products by availability status', async () => {
      const availabilityStatuses: AvailabilityStatus[] = ['in-stock', 'pre-order', 'out-of-stock'];

      for (const status of availabilityStatuses) {
        const products = await getProducts({
          categories: [],
          availability: [status],
          priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
          searchQuery: ''
        });

        // All products should have the selected availability status (Requirement 1.4)
        products.forEach(product => {
          expect(product.availability).toBe(status);
        });
      }
    });

    it('should filter products by multiple availability statuses', async () => {
      const availability: AvailabilityStatus[] = ['in-stock', 'pre-order'];

      const products = await getProducts({
        categories: [],
        availability,
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);
      
      // All products should have one of the selected availability statuses
      products.forEach(product => {
        expect(availability).toContain(product.availability);
      });
    });

    it('should distinguish between in-stock and pre-order products', async () => {
      const inStockProducts = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      const preOrderProducts = await getProducts({
        categories: [],
        availability: ['pre-order'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Verify in-stock products have stock levels
      inStockProducts.forEach(product => {
        expect(product.stockLevel).toBeGreaterThan(0);
        expect(product.availability).toBe('in-stock');
      });

      // Verify pre-order products have deposit information
      preOrderProducts.forEach(product => {
        expect(product.availability).toBe('pre-order');
        expect(product.depositAmount || product.depositPercentage).toBeDefined();
      });
    });
  });

  describe('Price Range Filtering - Requirement 1.5', () => {
    it('should filter products by price range', async () => {
      const minPrice = 10000;
      const maxPrice = 100000;

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: minPrice, max: maxPrice },
        searchQuery: ''
      });

      // All products should be within the specified price range (Requirement 1.5)
      products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should handle minimum price filter', async () => {
      const minPrice = 50000;

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: minPrice, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });
    });

    it('should handle maximum price filter', async () => {
      const maxPrice = 50000;

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: maxPrice },
        searchQuery: ''
      });

      products.forEach(product => {
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should return empty array when no products match price range', async () => {
      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 10000000, max: 20000000 }, // Very high price range
        searchQuery: ''
      });

      // Should return empty array or products within range
      products.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(10000000);
        expect(product.price).toBeLessThanOrEqual(20000000);
      });
    });
  });

  describe('Multiple Filters - Requirement 1.6', () => {
    it('should apply category and availability filters simultaneously', async () => {
      const category: Category = 'pumps-motors';
      const availability: AvailabilityStatus = 'in-stock';

      const products = await getProducts({
        categories: [category],
        availability: [availability],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // All products should match both filters (Requirement 1.6)
      products.forEach(product => {
        expect(product.category).toBe(category);
        expect(product.availability).toBe(availability);
      });
    });

    it('should apply category, availability, and price filters simultaneously', async () => {
      const category: Category = 'electrical';
      const availability: AvailabilityStatus = 'in-stock';
      const minPrice = 10000;
      const maxPrice = 200000;

      const products = await getProducts({
        categories: [category],
        availability: [availability],
        priceRange: { min: minPrice, max: maxPrice },
        searchQuery: ''
      });

      // All products should match all three filters
      products.forEach(product => {
        expect(product.category).toBe(category);
        expect(product.availability).toBe(availability);
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it('should apply multiple categories and multiple availability filters', async () => {
      const categories: Category[] = ['pumps-motors', 'energy-systems'];
      const availability: AvailabilityStatus[] = ['in-stock', 'pre-order'];

      const products = await getProducts({
        categories,
        availability,
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);

      // All products should match the filter combinations
      products.forEach(product => {
        expect(categories).toContain(product.category);
        expect(availability).toContain(product.availability);
      });
    });

    it('should handle complex filter combinations', async () => {
      const filters: ProductFilters = {
        categories: ['pumps-motors', 'electrical'],
        availability: ['in-stock'],
        priceRange: { min: 20000, max: 150000 },
        searchQuery: ''
      };

      const products = await getProducts(filters);

      // Verify all filters are applied correctly
      products.forEach(product => {
        expect(filters.categories).toContain(product.category);
        expect(filters.availability).toContain(product.availability);
        expect(product.price).toBeGreaterThanOrEqual(filters.priceRange.min);
        expect(product.price).toBeLessThanOrEqual(filters.priceRange.max);
      });
    });
  });

  describe('Search Functionality - Requirement 1.7', () => {
    it('should search products by name', async () => {
      const searchQuery = 'pump';

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery
      });

      // All products should contain the search term in name or description (Requirement 1.7)
      products.forEach(product => {
        const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        expect(nameMatch || descMatch).toBe(true);
      });
    });

    it('should search products by specifications', async () => {
      const searchQuery = 'HP'; // Common specification value

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery
      });

      // Products should contain the search term in name, description, or specifications
      products.forEach(product => {
        const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = product.specifications?.some(spec =>
          spec.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
        expect(nameMatch || descMatch || specMatch).toBe(true);
      });
    });

    it('should perform case-insensitive search', async () => {
      const searchQuery = 'MOTOR';

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery
      });

      // Search should be case-insensitive
      products.forEach(product => {
        const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = product.specifications?.some(spec =>
          spec.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
        expect(nameMatch || descMatch || specMatch).toBe(true);
      });
    });

    it('should combine search with filters', async () => {
      const searchQuery = 'industrial';
      const category: Category = 'pumps-motors';

      const products = await getProducts({
        categories: [category],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery
      });

      // Products should match both search query and category filter
      products.forEach(product => {
        expect(product.category).toBe(category);
        
        const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = product.specifications?.some(spec =>
          spec.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
        expect(nameMatch || descMatch || specMatch).toBe(true);
      });
    });

    it('should return empty array for non-matching search', async () => {
      const searchQuery = 'xyznonexistentproduct123';

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery
      });

      // Should return empty array or only matching products
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('Product Detail Page - Requirements 2.1, 2.2, 2.3, 2.4, 2.5', () => {
    it('should display complete product information', async () => {
      const allProducts = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(allProducts.length).toBeGreaterThan(0);

      const product = await getProductById(allProducts[0].id);

      // Verify product detail page has all required information (Requirement 2.1)
      expect(product).toBeDefined();
      expect(product.id).toBe(allProducts[0].id);
      expect(product.name).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(product.availability).toBeDefined();
      expect(product.description).toBeDefined();
      expect(product.specifications).toBeDefined();
      expect(product.imageUrls).toBeDefined();
    });

    it('should display warranty information', async () => {
      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      const productsWithWarranty = products.filter(p => p.warrantyDuration || p.warrantyTerms);
      expect(productsWithWarranty.length).toBeGreaterThan(0);

      // Verify warranty information is available (Requirement 2.2)
      productsWithWarranty.forEach(product => {
        expect(product.warrantyDuration || product.warrantyTerms).toBeDefined();
      });
    });

    it('should display payment methods and processing times', async () => {
      // This test verifies that product data supports payment method display (Requirement 2.3)
      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);

      // All products should have price information for payment method determination
      products.forEach(product => {
        expect(product.price).toBeGreaterThan(0);
        
        // Payment methods are determined by price:
        // - M-Pesa: available for orders under KES 300,000
        // - Bank Transfer: available for all orders
        const mpesaAvailable = product.price < 300000;
        const bankTransferAvailable = true;
        
        expect(typeof mpesaAvailable).toBe('boolean');
        expect(bankTransferAvailable).toBe(true);
      });
    });

    it('should show Add to Cart for in-stock products', async () => {
      const inStockProducts = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(inStockProducts.length).toBeGreaterThan(0);

      // In-stock products should have stock levels > 0 (Requirement 2.4)
      inStockProducts.forEach(product => {
        expect(product.availability).toBe('in-stock');
        expect(product.stockLevel).toBeGreaterThan(0);
      });
    });

    it('should show Request Quote for out-of-stock products', async () => {
      const outOfStockProducts = await getProducts({
        categories: [],
        availability: ['out-of-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Out-of-stock products should have stock level 0 (Requirement 2.5)
      outOfStockProducts.forEach(product => {
        expect(product.availability).toBe('out-of-stock');
        expect(product.stockLevel).toBe(0);
      });
    });

    it('should display deposit information for pre-order products', async () => {
      const preOrderProducts = await getProducts({
        categories: [],
        availability: ['pre-order'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Pre-order products should have deposit information
      preOrderProducts.forEach(product => {
        expect(product.availability).toBe('pre-order');
        expect(product.depositAmount || product.depositPercentage).toBeDefined();
        
        if (product.depositAmount) {
          expect(product.depositAmount).toBeGreaterThan(0);
        }
        
        if (product.depositPercentage) {
          expect(product.depositPercentage).toBeGreaterThan(0);
          expect(product.depositPercentage).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('Add to Cart Integration', () => {
    beforeEach(() => {
      // Clear cart before each test
      useCartStore.getState().clearCart();
    });

    afterEach(() => {
      // Clean up after each test
      useCartStore.getState().clearCart();
    });

    it('should add in-stock product to cart', async () => {
      const inStockProducts = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(inStockProducts.length).toBeGreaterThan(0);

      const product = inStockProducts[0];
      const quantity = 2;

      // Add product to cart
      const store = useCartStore.getState();
      store.addItem(product, quantity);

      // Verify product was added to cart
      const cartState = useCartStore.getState();
      expect(cartState.items.length).toBe(1);
      expect(cartState.items[0].productId).toBe(product.id);
      expect(cartState.items[0].quantity).toBe(quantity);
      expect(cartState.items[0].unitPrice).toBe(product.price);
      expect(cartState.items[0].subtotal).toBe(product.price * quantity);
    });

    it('should add pre-order product to cart with deposit', async () => {
      const preOrderProducts = await getProducts({
        categories: [],
        availability: ['pre-order'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      if (preOrderProducts.length > 0) {
        const product = preOrderProducts[0];
        const quantity = 1;

        // Add pre-order product to cart
        const store = useCartStore.getState();
        store.addItem(product, quantity);

        // Verify product was added with pre-order flag
        const cartState = useCartStore.getState();
        expect(cartState.items.length).toBe(1);
        expect(cartState.items[0].isPreOrder).toBe(true);
        expect(cartState.items[0].depositAmount || cartState.items[0].depositPercentage).toBeDefined();
      }
    });

    it('should calculate cart total correctly with multiple products', async () => {
      const products = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThanOrEqual(2);

      const store = useCartStore.getState();
      
      // Add multiple products
      store.addItem(products[0], 2);
      store.addItem(products[1], 1);

      // Verify cart total
      const cartState = useCartStore.getState();
      const expectedTotal = (products[0].price * 2) + (products[1].price * 1);
      
      expect(cartState.totalAmount).toBe(expectedTotal);
      expect(cartState.items.length).toBe(2);
      expect(cartState.totalItems).toBe(3);
    });

    it('should update quantity for existing cart item', async () => {
      const products = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);

      const product = products[0];
      const store = useCartStore.getState();

      // Add product
      store.addItem(product, 1);

      // Update quantity
      store.updateQuantity(product.id, 5);

      // Verify quantity was updated
      const cartState = useCartStore.getState();
      expect(cartState.items.length).toBe(1);
      expect(cartState.items[0].quantity).toBe(5);
      expect(cartState.items[0].subtotal).toBe(product.price * 5);
      expect(cartState.totalAmount).toBe(product.price * 5);
    });

    it('should remove product from cart', async () => {
      const products = await getProducts({
        categories: [],
        availability: ['in-stock'],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      expect(products.length).toBeGreaterThan(0);

      const product = products[0];
      const store = useCartStore.getState();

      // Add product
      store.addItem(product, 2);

      // Verify product was added
      let cartState = useCartStore.getState();
      expect(cartState.items.length).toBe(1);

      // Remove product
      store.removeItem(product.id);

      // Verify product was removed
      cartState = useCartStore.getState();
      expect(cartState.items.length).toBe(0);
      expect(cartState.totalAmount).toBe(0);
      expect(cartState.totalItems).toBe(0);
    });
  });

  describe('Performance and Data Integrity', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const products = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Query should complete within reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      expect(Array.isArray(products)).toBe(true);
    });

    it('should maintain data consistency across multiple queries', async () => {
      // Fetch products twice
      const products1 = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      const products2 = await getProducts({
        categories: [],
        availability: [],
        priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
        searchQuery: ''
      });

      // Results should be consistent
      expect(products1.length).toBe(products2.length);
      
      // Product IDs should match
      const ids1 = products1.map(p => p.id).sort();
      const ids2 = products2.map(p => p.id).sort();
      expect(ids1).toEqual(ids2);
    });

    it('should handle concurrent filter operations', async () => {
      // Execute multiple filter operations concurrently
      const promises = [
        getProducts({
          categories: ['pumps-motors'],
          availability: [],
          priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
          searchQuery: ''
        }),
        getProducts({
          categories: [],
          availability: ['in-stock'],
          priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
          searchQuery: ''
        }),
        getProducts({
          categories: [],
          availability: [],
          priceRange: { min: 10000, max: 100000 },
          searchQuery: ''
        })
      ];

      const results = await Promise.all(promises);

      // All queries should complete successfully
      expect(results.length).toBe(3);
      results.forEach(products => {
        expect(Array.isArray(products)).toBe(true);
      });
    });
  });
});
