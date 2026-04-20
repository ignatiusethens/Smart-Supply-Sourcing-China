import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { useCartStore } from '@/lib/stores/cartStore';
import { Product, AvailabilityStatus } from '@/types';

/**
 * Property-Based Test for Pre-Order Deposit Calculation
 * 
 * **Validates: Requirements 4.3, 28.6**
 * 
 * Property 8: Pre-Order Deposit Calculation
 * For any cart containing pre-order items, the total deposit required SHALL equal 
 * the sum of (depositPercentage × unitPrice × quantity) for all pre-order items.
 * 
 * Requirements:
 * - 4.3: WHEN a Buyer adds a pre-order item to Cart, THE Platform SHALL calculate the deposit amount required
 * - 28.6: WHEN a cart contains pre-order items, THE Platform SHALL calculate total deposit required
 */

// Arbitraries for generating test data
const preOrderProductArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 1000, max: 1000000 }), // KES 1k to 1M
  depositAmount: fc.option(fc.integer({ min: 100, max: 100000 })), // Fixed deposit amount
  depositPercentage: fc.option(fc.integer({ min: 10, max: 50 })) // Percentage-based deposit
});

const regularProductArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 1000, max: 1000000 })
});

const cartItemArbitrary = fc.record({
  product: fc.oneof(
    preOrderProductArbitrary.map(p => ({ ...p, availability: 'pre-order' as AvailabilityStatus })),
    regularProductArbitrary.map(p => ({ ...p, availability: 'in-stock' as AvailabilityStatus }))
  ),
  quantity: fc.integer({ min: 1, max: 50 })
});

// Helper function to create a mock product with all required fields
function createMockProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    category: 'pumps-motors',
    price: data.price,
    availability: data.availability,
    stockLevel: 100,
    description: 'Test product',
    imageUrls: [],
    specifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    depositAmount: data.depositAmount,
    depositPercentage: data.depositPercentage
  };
}

// Helper function to calculate expected deposit manually
function calculateExpectedDeposit(cartData: Array<{ product: any; quantity: number }>): number {
  return cartData.reduce((sum, item) => {
    if (item.product.availability === 'pre-order') {
      // Use depositAmount if available, otherwise calculate from depositPercentage
      if (item.product.depositAmount) {
        return sum + (item.quantity * item.product.depositAmount);
      } else if (item.product.depositPercentage) {
        return sum + (item.quantity * item.product.price * item.product.depositPercentage / 100);
      }
    }
    return sum;
  }, 0);
}

describe('Pre-Order Deposit Calculation Properties', () => {
  // Reset cart before each test and clear any persisted state
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    useCartStore.setState({ items: [], totalAmount: 0, totalItems: 0 });
  });

  afterEach(() => {
    useCartStore.getState().clearCart();
    localStorage.clear();
  });

  it('Property 8: Pre-order deposit calculation with fixed deposit amounts', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * For any cart containing pre-order items with fixed deposit amounts,
     * the total deposit required SHALL equal the sum of (depositAmount × quantity) 
     * for all pre-order items.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            product: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              price: fc.integer({ min: 1000, max: 500000 }),
              availability: fc.constantFrom<AvailabilityStatus>('pre-order', 'in-stock'),
              depositAmount: fc.integer({ min: 500, max: 50000 })
            }),
            quantity: fc.integer({ min: 1, max: 20 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (cartData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Add all items to cart
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`
            });
            store.addItem(product, itemData.quantity);
          });
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected deposit manually - only for pre-order items
          const expectedDeposit = cartData.reduce((sum, item) => {
            if (item.product.availability === 'pre-order') {
              return sum + (item.quantity * item.product.depositAmount);
            }
            return sum;
          }, 0);
          
          // Verify deposit calculation
          const actualDeposit = cartState.getTotalDeposit();
          expect(actualDeposit).toBe(expectedDeposit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Pre-order deposit calculation with percentage-based deposits', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * For any cart containing pre-order items with percentage-based deposits,
     * the total deposit required SHALL equal the sum of (depositPercentage × unitPrice × quantity) 
     * for all pre-order items.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            product: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              price: fc.integer({ min: 1000, max: 500000 }),
              availability: fc.constantFrom<AvailabilityStatus>('pre-order', 'in-stock'),
              depositPercentage: fc.integer({ min: 10, max: 50 })
            }),
            quantity: fc.integer({ min: 1, max: 20 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (cartData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Add all items to cart
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`,
              // For this test, we'll use percentage-based calculation
              depositAmount: undefined // Ensure we use percentage calculation
            });
            store.addItem(product, itemData.quantity);
          });
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected deposit manually - only for pre-order items using percentage
          const expectedDeposit = cartData.reduce((sum, item) => {
            if (item.product.availability === 'pre-order') {
              return sum + (item.quantity * item.product.price * item.product.depositPercentage / 100);
            }
            return sum;
          }, 0);
          
          // Verify deposit calculation with percentage-based deposits
          const actualDeposit = cartState.getTotalDeposit();
          expect(actualDeposit).toBe(expectedDeposit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Mixed cart with pre-order and regular items', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * For any cart containing both pre-order and regular items,
     * the total deposit required SHALL only include deposits from pre-order items.
     */
    fc.assert(
      fc.property(
        fc.array(cartItemArbitrary, { minLength: 2, maxLength: 8 }),
        (cartData) => {
          // Ensure we have at least one pre-order and one regular item
          const hasPreOrder = cartData.some(item => item.product.availability === 'pre-order');
          const hasRegular = cartData.some(item => item.product.availability === 'in-stock');
          
          // Skip if we don't have mixed items
          fc.pre(hasPreOrder && hasRegular);
          
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Add all items to cart
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`
            });
            store.addItem(product, itemData.quantity);
          });
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected deposit manually - only from pre-order items
          const expectedDeposit = calculateExpectedDeposit(cartData);
          
          // Verify deposit calculation excludes regular items
          const actualDeposit = cartState.getTotalDeposit();
          expect(actualDeposit).toBe(expectedDeposit);
          
          // Verify that regular items don't contribute to deposit
          const preOrderItems = cartData.filter(item => item.product.availability === 'pre-order');
          const regularItems = cartData.filter(item => item.product.availability === 'in-stock');
          
          expect(preOrderItems.length).toBeGreaterThan(0);
          expect(regularItems.length).toBeGreaterThan(0);
          
          // Verify that only pre-order items with deposit amounts or percentages contribute
          const hasAnyDeposit = preOrderItems.some(item => 
            item.product.depositAmount || item.product.depositPercentage
          );
          
          if (!hasAnyDeposit) {
            expect(actualDeposit).toBe(0);
          } else {
            expect(actualDeposit).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Single pre-order item deposit calculation', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * When a Buyer adds a single pre-order item to Cart,
     * the Platform SHALL calculate the deposit amount required correctly.
     */
    fc.assert(
      fc.property(
        fc.record({
          product: fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            price: fc.integer({ min: 1000, max: 500000 }),
            depositAmount: fc.integer({ min: 500, max: 50000 })
          }),
          quantity: fc.integer({ min: 1, max: 20 })
        }),
        (itemData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          const product = createMockProduct({
            ...itemData.product,
            availability: 'pre-order'
          });
          
          // Add pre-order item to cart
          store.addItem(product, itemData.quantity);
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected deposit
          const expectedDeposit = itemData.quantity * itemData.product.depositAmount;
          
          // Verify deposit calculation for single item
          const actualDeposit = cartState.getTotalDeposit();
          expect(actualDeposit).toBe(expectedDeposit);
          
          // Verify cart has the item marked as pre-order
          expect(cartState.items).toHaveLength(1);
          expect(cartState.items[0].isPreOrder).toBe(true);
          expect(cartState.items[0].depositAmount).toBe(itemData.product.depositAmount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Deposit calculation remains consistent after quantity updates', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * When quantity of pre-order items is updated,
     * the deposit calculation SHALL remain mathematically consistent.
     */
    fc.assert(
      fc.property(
        fc.record({
          product: fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            price: fc.integer({ min: 1000, max: 500000 }),
            depositAmount: fc.integer({ min: 500, max: 50000 })
          }),
          initialQuantity: fc.integer({ min: 1, max: 20 }),
          newQuantity: fc.integer({ min: 1, max: 30 })
        }),
        (data) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          const product = createMockProduct({
            ...data.product,
            availability: 'pre-order'
          });
          
          // Add initial quantity
          store.addItem(product, data.initialQuantity);
          
          // Verify initial deposit
          let cartState = useCartStore.getState();
          let expectedDeposit = data.initialQuantity * data.product.depositAmount;
          expect(cartState.getTotalDeposit()).toBe(expectedDeposit);
          
          // Update quantity
          store.updateQuantity(product.id, data.newQuantity);
          
          // Verify updated deposit
          cartState = useCartStore.getState();
          expectedDeposit = data.newQuantity * data.product.depositAmount;
          expect(cartState.getTotalDeposit()).toBe(expectedDeposit);
          
          // Verify item properties are updated correctly
          expect(cartState.items).toHaveLength(1);
          expect(cartState.items[0].quantity).toBe(data.newQuantity);
          expect(cartState.items[0].isPreOrder).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: No deposit for regular items', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * For any cart containing only regular (in-stock) items,
     * the total deposit required SHALL be zero.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            product: fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              price: fc.integer({ min: 1000, max: 500000 })
            }),
            quantity: fc.integer({ min: 1, max: 20 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (cartData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Add all items as regular (in-stock) items
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`,
              availability: 'in-stock' // Force all items to be regular
            });
            store.addItem(product, itemData.quantity);
          });
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Verify no deposit required for regular items
          const actualDeposit = cartState.getTotalDeposit();
          expect(actualDeposit).toBe(0);
          
          // Verify all items are marked as not pre-order
          cartState.items.forEach(item => {
            expect(item.isPreOrder).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Empty cart has zero deposit', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * An empty cart SHALL always have a total deposit of zero.
     */
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed for this property
        () => {
          const store = useCartStore.getState();
          
          // Ensure cart is empty
          store.clearCart();
          
          const cartState = useCartStore.getState();
          
          // Verify empty cart has zero deposit
          expect(cartState.getTotalDeposit()).toBe(0);
          expect(cartState.items).toHaveLength(0);
        }
      ),
      { numRuns: 10 } // Fewer runs needed for this simple property
    );
  });
});