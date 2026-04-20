import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { useCartStore } from '@/lib/stores/cartStore';
import { CartItem, Product, AvailabilityStatus } from '@/types';

/**
 * Property-Based Test for Cart Total Calculation Accuracy
 * 
 * **Validates: Requirements 3.3, 3.5, 28.2**
 * 
 * Property 2: Cart Total Calculation Accuracy
 * For any set of cart items with quantities and unit prices, 
 * the calculated total SHALL equal the sum of all (quantity × unitPrice) for each item.
 */

// Arbitraries for generating test data
const availabilityArbitrary = fc.constantFrom<AvailabilityStatus>('in-stock', 'pre-order', 'out-of-stock');

const productArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.integer({ min: 100, max: 1000000 }), // KES 100 to 1M
  availability: availabilityArbitrary,
  depositAmount: fc.option(fc.integer({ min: 1000, max: 100000 })),
  depositPercentage: fc.option(fc.integer({ min: 10, max: 50 }))
});

const cartItemDataArbitrary = fc.record({
  product: productArbitrary,
  quantity: fc.integer({ min: 1, max: 100 })
});

// Helper function to create a mock product with required fields
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

// Helper function to calculate expected total manually
function calculateExpectedTotal(cartData: Array<{ product: any; quantity: number }>): number {
  return cartData.reduce((sum, item) => {
    return sum + (item.quantity * item.product.price);
  }, 0);
}

// Helper function to calculate expected deposit manually
function calculateExpectedDeposit(cartData: Array<{ product: any; quantity: number }>): number {
  return cartData.reduce((sum, item) => {
    if (item.product.availability === 'pre-order' && item.product.depositAmount) {
      return sum + (item.quantity * item.product.depositAmount);
    }
    return sum;
  }, 0);
}

describe('Cart Total Calculation Properties', () => {
  // Reset cart before each test and clear any persisted state
  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    // Reset the store state
    useCartStore.getState().clearCart();
    // Force re-initialization of the store
    useCartStore.setState({ items: [], totalAmount: 0, totalItems: 0 });
  });

  afterEach(() => {
    // Clean up after each test
    useCartStore.getState().clearCart();
    localStorage.clear();
  });

  it('Property 2: Cart total calculation accuracy - single item', () => {
    /**
     * **Validates: Requirements 3.3, 3.5, 28.2**
     * 
     * For any single cart item with quantity and unit price,
     * the cart total SHALL equal quantity × unitPrice
     */
    fc.assert(
      fc.property(
        cartItemDataArbitrary,
        (itemData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          const product = createMockProduct(itemData.product);
          
          // Add item to cart
          store.addItem(product, itemData.quantity);
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected total
          const expectedTotal = itemData.quantity * itemData.product.price;
          
          // Verify cart total matches expected calculation
          expect(cartState.totalAmount).toBe(expectedTotal);
          expect(cartState.items).toHaveLength(1);
          expect(cartState.items[0].subtotal).toBe(expectedTotal);
          expect(cartState.totalItems).toBe(itemData.quantity);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Cart total calculation accuracy - multiple items', () => {
    /**
     * **Validates: Requirements 3.3, 3.5, 28.2**
     * 
     * For any set of cart items with quantities and unit prices,
     * the calculated total SHALL equal the sum of all (quantity × unitPrice) for each item.
     */
    fc.assert(
      fc.property(
        fc.array(cartItemDataArbitrary, { minLength: 1, maxLength: 10 }),
        (cartData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Add all items to cart
          cartData.forEach((itemData, index) => {
            // Ensure unique product IDs to avoid merging
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`
            });
            store.addItem(product, itemData.quantity);
          });
          
          // Get cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected total manually
          const expectedTotal = calculateExpectedTotal(cartData);
          
          // Calculate expected total items
          const expectedTotalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
          
          // Verify cart total matches expected calculation
          expect(cartState.totalAmount).toBe(expectedTotal);
          expect(cartState.items).toHaveLength(cartData.length);
          expect(cartState.totalItems).toBe(expectedTotalItems);
          
          // Verify each item's subtotal is correct
          cartState.items.forEach((cartItem, index) => {
            const originalData = cartData[index];
            const expectedSubtotal = originalData.quantity * originalData.product.price;
            expect(cartItem.subtotal).toBe(expectedSubtotal);
            expect(cartItem.quantity).toBe(originalData.quantity);
            expect(cartItem.unitPrice).toBe(originalData.product.price);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Cart total recalculation on quantity update', () => {
    /**
     * **Validates: Requirements 3.3, 3.5**
     * 
     * When cart contents change (quantity update), 
     * the Platform SHALL recalculate the total price correctly.
     */
    fc.assert(
      fc.property(
        cartItemDataArbitrary,
        fc.integer({ min: 1, max: 50 }),
        (itemData, newQuantity) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          const product = createMockProduct(itemData.product);
          
          // Add initial item
          store.addItem(product, itemData.quantity);
          
          // Update quantity
          store.updateQuantity(product.id, newQuantity);
          
          // Get updated cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected total with new quantity
          const expectedTotal = newQuantity * itemData.product.price;
          
          // Verify cart total is recalculated correctly
          expect(cartState.totalAmount).toBe(expectedTotal);
          expect(cartState.items).toHaveLength(1);
          expect(cartState.items[0].quantity).toBe(newQuantity);
          expect(cartState.items[0].subtotal).toBe(expectedTotal);
          expect(cartState.totalItems).toBe(newQuantity);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Cart total recalculation on item removal', () => {
    /**
     * **Validates: Requirements 3.3, 3.5**
     * 
     * When cart contents change (item removal), 
     * the Platform SHALL recalculate the total price correctly.
     */
    fc.assert(
      fc.property(
        fc.array(cartItemDataArbitrary, { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (cartData, removeIndex) => {
          // Ensure removeIndex is valid
          const validRemoveIndex = removeIndex % cartData.length;
          
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
          
          // Remove one item
          const productToRemove = `product-${validRemoveIndex}-${cartData[validRemoveIndex].product.id}`;
          store.removeItem(productToRemove);
          
          // Get updated cart state
          const cartState = useCartStore.getState();
          
          // Calculate expected total without the removed item
          const remainingItems = cartData.filter((_, index) => index !== validRemoveIndex);
          const expectedTotal = calculateExpectedTotal(remainingItems);
          const expectedTotalItems = remainingItems.reduce((sum, item) => sum + item.quantity, 0);
          
          // Verify cart total is recalculated correctly
          expect(cartState.totalAmount).toBe(expectedTotal);
          expect(cartState.items).toHaveLength(remainingItems.length);
          expect(cartState.totalItems).toBe(expectedTotalItems);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Pre-order deposit calculation accuracy', () => {
    /**
     * **Validates: Requirements 4.3, 28.6**
     * 
     * For any cart containing pre-order items with deposit amounts,
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
              availability: fc.constantFrom<AvailabilityStatus>('in-stock', 'pre-order'),
              depositAmount: fc.integer({ min: 500, max: 50000 })
            }),
            quantity: fc.integer({ min: 1, max: 20 })
          }),
          { minLength: 1, maxLength: 8 }
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
          
          // Calculate expected deposit manually
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

  it('Property 2: Cart total consistency across operations', () => {
    /**
     * **Validates: Requirements 3.3, 3.5, 28.2**
     * 
     * The cart total calculation SHALL remain mathematically consistent
     * regardless of the order of operations (add, update, remove).
     */
    fc.assert(
      fc.property(
        fc.array(cartItemDataArbitrary, { minLength: 1, maxLength: 5 }),
        (cartData) => {
          // Clear cart state at start of each property test iteration
          useCartStore.getState().clearCart();
          
          const store = useCartStore.getState();
          
          // Scenario 1: Add all items at once
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`
            });
            store.addItem(product, itemData.quantity);
          });
          
          const totalAfterAdding = useCartStore.getState().totalAmount;
          
          // Clear cart
          store.clearCart();
          
          // Scenario 2: Add items one by one and verify total at each step
          let runningTotal = 0;
          cartData.forEach((itemData, index) => {
            const product = createMockProduct({
              ...itemData.product,
              id: `product-${index}-${itemData.product.id}`
            });
            store.addItem(product, itemData.quantity);
            
            runningTotal += itemData.quantity * itemData.product.price;
            const currentTotal = useCartStore.getState().totalAmount;
            
            // Verify running total matches cart total
            expect(currentTotal).toBe(runningTotal);
          });
          
          const totalAfterSequentialAdding = useCartStore.getState().totalAmount;
          
          // Both scenarios should produce the same total
          expect(totalAfterSequentialAdding).toBe(totalAfterAdding);
          
          // Final verification: manual calculation should match
          const expectedTotal = calculateExpectedTotal(cartData);
          expect(totalAfterSequentialAdding).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Empty cart has zero total', () => {
    /**
     * **Validates: Requirements 3.3, 3.5, 28.2**
     * 
     * An empty cart SHALL always have a total amount of zero.
     */
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed for this property
        () => {
          const store = useCartStore.getState();
          
          // Ensure cart is empty
          store.clearCart();
          
          const cartState = useCartStore.getState();
          
          // Verify empty cart properties
          expect(cartState.totalAmount).toBe(0);
          expect(cartState.totalItems).toBe(0);
          expect(cartState.items).toHaveLength(0);
          expect(cartState.getTotalDeposit()).toBe(0);
        }
      ),
      { numRuns: 10 } // Fewer runs needed for this simple property
    );
  });
});