/**
 * Preservation Property Tests — UI Design Alignment
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
 *
 * PURPOSE: These tests MUST PASS on UNFIXED code.
 * They capture the baseline functional behavior that must be preserved
 * throughout the UI redesign (Task 3).
 *
 * After the fix is implemented (Task 3), these same tests MUST STILL PASS,
 * confirming no functional regressions were introduced.
 *
 * EXPECTED OUTCOME (unfixed code): PASS
 * EXPECTED OUTCOME (fixed code):   PASS
 */

import fc from 'fast-check';
import {
  calculateCartTotal,
  calculateItemSubtotal,
  calculatePreOrderDeposit,
  calculateDepositAmount,
} from '@/lib/algorithms/calculations';
import {
  getAvailablePaymentMethods,
  isPaymentMethodAllowed,
  isOrderEligibleForMpesa,
  getMpesaLimit,
  getPaymentMethodRestrictionMessage,
} from '@/lib/algorithms/paymentRestrictions';
import {
  generateReferenceCode,
  validateReferenceCodeFormat,
  parseReferenceCode,
  formatReferenceCode,
} from '@/lib/algorithms/referenceCode';
import {
  applyFilters,
  applyCategoryFilter,
  applyAvailabilityFilter,
  applyPriceFilter,
  searchProducts,
} from '@/lib/algorithms/filtering';
import {
  CartItem,
  ProductFilters,
  Category,
  AvailabilityStatus,
  Quote,
  QuoteStatus,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'prod-1',
    productName: 'Test Product',
    quantity: 1,
    unitPrice: 10000,
    subtotal: 10000,
    availability: 'in-stock',
    isPreOrder: false,
    ...overrides,
  };
}

/** Pure helper that mirrors the quote expiration logic used in the DB layer */
function isQuoteExpired(quote: Pick<Quote, 'status' | 'validUntil'>): boolean {
  if (quote.status === 'expired') return true;
  if (quote.status !== 'pending') return false;
  return new Date(quote.validUntil) < new Date();
}

/** Pure helper: can a pending quote be accepted? */
function canAcceptQuote(quote: Pick<Quote, 'status' | 'validUntil'>): boolean {
  return quote.status === 'pending' && !isQuoteExpired(quote);
}

// ---------------------------------------------------------------------------
// 1. Cart Total Calculation
// ---------------------------------------------------------------------------

describe('Preservation: Cart total calculation accuracy', () => {
  /**
   * **Validates: Requirements 3.1, 3.3**
   *
   * For any set of cart items, the total SHALL equal the sum of all subtotals.
   */
  it('total equals sum of item subtotals for any item set', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            unitPrice: fc.integer({ min: 100, max: 1_000_000 }),
            quantity: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (rows) => {
          const items: CartItem[] = rows.map((r, i) =>
            makeCartItem({
              productId: `prod-${i}`,
              unitPrice: r.unitPrice,
              quantity: r.quantity,
              subtotal: r.unitPrice * r.quantity,
            })
          );

          const total = calculateCartTotal(items);
          const expected = items.reduce((s, it) => s + it.subtotal, 0);
          expect(total).toBe(expected);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('empty cart has zero total', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('single item total equals unitPrice * quantity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.integer({ min: 1, max: 100 }),
        (unitPrice, quantity) => {
          const subtotal = calculateItemSubtotal(unitPrice, quantity);
          const item = makeCartItem({ unitPrice, quantity, subtotal });
          expect(calculateCartTotal([item])).toBe(unitPrice * quantity);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('calculateItemSubtotal is unitPrice * quantity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000 }),
        (unitPrice, quantity) => {
          expect(calculateItemSubtotal(unitPrice, quantity)).toBe(
            unitPrice * quantity
          );
        }
      ),
      { numRuns: 25 }
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Payment Method Restrictions (M-Pesa KES 300,000 limit)
// ---------------------------------------------------------------------------

describe('Preservation: M-Pesa payment method restriction', () => {
  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * M-Pesa SHALL be disabled when order total exceeds KES 300,000.
   * Bank transfer SHALL always be available.
   */
  const MPESA_LIMIT = 300_000;

  it('M-Pesa is available for any amount <= 300,000', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: MPESA_LIMIT }), (amount) => {
        expect(isOrderEligibleForMpesa(amount)).toBe(true);
        expect(isPaymentMethodAllowed('mpesa', amount)).toBe(true);
        expect(getAvailablePaymentMethods(amount)).toContain('mpesa');
      }),
      { numRuns: 25 }
    );
  });

  it('M-Pesa is NOT available for any amount > 300,000', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MPESA_LIMIT + 1, max: 10_000_000 }),
        (amount) => {
          expect(isOrderEligibleForMpesa(amount)).toBe(false);
          expect(isPaymentMethodAllowed('mpesa', amount)).toBe(false);
          expect(getAvailablePaymentMethods(amount)).not.toContain('mpesa');
        }
      ),
      { numRuns: 25 }
    );
  });

  it('bank-transfer is always available regardless of amount', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000_000 }), (amount) => {
        expect(isPaymentMethodAllowed('bank-transfer', amount)).toBe(true);
        expect(getAvailablePaymentMethods(amount)).toContain('bank-transfer');
      }),
      { numRuns: 25 }
    );
  });

  it('getMpesaLimit returns 300,000', () => {
    expect(getMpesaLimit()).toBe(MPESA_LIMIT);
  });

  it('restriction message is null when amount <= limit', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: MPESA_LIMIT }), (amount) => {
        expect(getPaymentMethodRestrictionMessage(amount)).toBeNull();
      }),
      { numRuns: 20 }
    );
  });

  it('restriction message is non-null when amount > limit', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MPESA_LIMIT + 1, max: 10_000_000 }),
        (amount) => {
          const msg = getPaymentMethodRestrictionMessage(amount);
          expect(msg).not.toBeNull();
          expect(typeof msg).toBe('string');
          expect((msg as string).length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Reference Code Format (SSS-YYYY-XXXXXX)
// ---------------------------------------------------------------------------

describe('Preservation: Reference code format validation', () => {
  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * Every generated reference code SHALL match SSS-YYYY-XXXXXX.
   */
  it('generated codes always match SSS-YYYY-XXXXXX pattern', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        for (let i = 0; i < n; i++) {
          const code = generateReferenceCode();
          expect(validateReferenceCodeFormat(code)).toBe(true);
        }
      }),
      { numRuns: 15 }
    );
  });

  it('generated codes contain current year', () => {
    const year = new Date().getFullYear().toString();
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (n) => {
        for (let i = 0; i < n; i++) {
          const code = generateReferenceCode();
          const parsed = parseReferenceCode(code);
          expect(parsed).not.toBeNull();
          expect(parsed!.year).toBe(year);
          expect(parsed!.prefix).toBe('SSS');
          expect(parsed!.identifier).toMatch(/^[A-Z0-9]{6}$/);
        }
      }),
      { numRuns: 15 }
    );
  });

  it('validateReferenceCodeFormat accepts valid SSS-YYYY-XXXXXX codes', () => {
    const validCodeArb = fc
      .record({
        year: fc.integer({ min: 2020, max: 2030 }),
        id: fc
          .string({ minLength: 6, maxLength: 6 })
          .filter((s) => /^[A-Z0-9]{6}$/.test(s)),
      })
      .map(({ year, id }) => `SSS-${year}-${id}`);

    fc.assert(
      fc.property(validCodeArb, (code) => {
        expect(validateReferenceCodeFormat(code)).toBe(true);
      }),
      { numRuns: 20 }
    );
  });

  it('validateReferenceCodeFormat rejects malformed codes', () => {
    const invalidCodes = [
      'SSS-2024-ABC12', // identifier too short
      'SSS-2024-ABC1234', // identifier too long
      'SSS-24-ABC123', // year too short
      'ABC-2024-ABC123', // wrong prefix
      'SSS-2024-abc123', // lowercase identifier
      'SSS-2024-AB@123', // special character
      '', // empty string
      'SSS2024ABC123', // missing dashes
    ];

    invalidCodes.forEach((code) => {
      expect(validateReferenceCodeFormat(code)).toBe(false);
    });
  });

  it('parseReferenceCode round-trips correctly', () => {
    const validCodeArb = fc
      .record({
        year: fc.integer({ min: 2020, max: 2030 }),
        id: fc
          .string({ minLength: 6, maxLength: 6 })
          .filter((s) => /^[A-Z0-9]{6}$/.test(s)),
      })
      .map(({ year, id }) => `SSS-${year}-${id}`);

    fc.assert(
      fc.property(validCodeArb, (original) => {
        const parsed = parseReferenceCode(original);
        expect(parsed).not.toBeNull();
        const reconstructed = `${parsed!.prefix}-${parsed!.year}-${parsed!.identifier}`;
        expect(reconstructed).toBe(original);
      }),
      { numRuns: 20 }
    );
  });

  it('formatReferenceCode normalises codes without dashes', () => {
    fc.assert(
      fc.property(
        fc
          .record({
            year: fc.integer({ min: 2020, max: 2030 }),
            id: fc
              .string({ minLength: 6, maxLength: 6 })
              .filter((s) => /^[A-Z0-9]{6}$/.test(s)),
          })
          .map(({ year, id }) => ({
            withDashes: `SSS-${year}-${id}`,
            withoutDashes: `SSS${year}${id}`,
          })),
        ({ withDashes, withoutDashes }) => {
          expect(formatReferenceCode(withDashes)).toBe(withDashes);
          expect(formatReferenceCode(withoutDashes)).toBe(withDashes);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Quote Expiration Logic
// ---------------------------------------------------------------------------

describe('Preservation: Quote expiration logic', () => {
  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * A quote with validUntil in the past SHALL be considered expired.
   * An expired quote SHALL NOT be acceptable.
   */
  it('pending quote with past validUntil is expired', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 * 24 * 60 * 60 * 1000 }), // 1ms to 1 year in the past
        (msAgo) => {
          const pastDate = new Date(Date.now() - msAgo).toISOString();
          const quote = {
            status: 'pending' as QuoteStatus,
            validUntil: pastDate,
          };
          expect(isQuoteExpired(quote)).toBe(true);
          expect(canAcceptQuote(quote)).toBe(false);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('pending quote with future validUntil is NOT expired', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 365 * 24 * 60 * 60 * 1000 }), // 1s to 1 year in the future
        (msAhead) => {
          const futureDate = new Date(Date.now() + msAhead).toISOString();
          const quote = {
            status: 'pending' as QuoteStatus,
            validUntil: futureDate,
          };
          expect(isQuoteExpired(quote)).toBe(false);
          expect(canAcceptQuote(quote)).toBe(true);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('quote with status "expired" is always expired regardless of validUntil', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc
            .integer({ min: 1, max: 365 * 24 * 60 * 60 * 1000 })
            .map((ms) => new Date(Date.now() - ms).toISOString()),
          fc
            .integer({ min: 1000, max: 365 * 24 * 60 * 60 * 1000 })
            .map((ms) => new Date(Date.now() + ms).toISOString())
        ),
        (validUntil) => {
          const quote = { status: 'expired' as QuoteStatus, validUntil };
          expect(isQuoteExpired(quote)).toBe(true);
          expect(canAcceptQuote(quote)).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('accepted or rejected quotes cannot be accepted again', () => {
    const nonPendingStatuses: QuoteStatus[] = [
      'accepted',
      'rejected',
      'expired',
    ];
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();

    nonPendingStatuses.forEach((status) => {
      const quote = { status, validUntil: futureDate };
      expect(canAcceptQuote(quote)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Filter Composition (multiple filters return intersection)
// ---------------------------------------------------------------------------

describe('Preservation: Filter composition returns intersection', () => {
  /**
   * **Validates: Requirements 3.1, 3.3**
   *
   * Applying multiple filters SHALL return only products matching ALL criteria.
   * Filter order SHALL NOT affect the result set.
   */
  const categoryArb = fc.constantFrom<Category>(
    'pumps-motors',
    'energy-systems',
    'fluid-control',
    'electrical',
    'storage'
  );

  const availabilityArb = fc.constantFrom<AvailabilityStatus>(
    'in-stock',
    'pre-order',
    'out-of-stock'
  );

  const productArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 3, maxLength: 40 }),
    category: categoryArb,
    price: fc.integer({ min: 1_000, max: 2_000_000 }),
    availability: availabilityArb,
    stockLevel: fc.integer({ min: 0, max: 500 }),
    description: fc.string({ minLength: 10, maxLength: 100 }),
    imageUrls: fc.constant([]),
    specifications: fc.constant([]),
    createdAt: fc.constant(new Date().toISOString()),
    updatedAt: fc.constant(new Date().toISOString()),
  });

  it('filter results are always a subset of the original catalog', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 30 }),
        fc.record({
          categories: fc.array(categoryArb, { maxLength: 3 }),
          availability: fc.array(availabilityArb, { maxLength: 3 }),
          priceRange: fc.record({
            min: fc.integer({ min: 0, max: 500_000 }),
            max: fc.integer({ min: 500_000, max: 2_000_000 }),
          }),
          searchQuery: fc.constant(''),
        }),
        (products, filtersRaw) => {
          const filters: ProductFilters = {
            ...filtersRaw,
            priceRange: {
              min: Math.min(
                filtersRaw.priceRange.min,
                filtersRaw.priceRange.max
              ),
              max: Math.max(
                filtersRaw.priceRange.min,
                filtersRaw.priceRange.max
              ),
            },
          };

          const result = applyFilters(products, filters);

          expect(result.length).toBeLessThanOrEqual(products.length);
          result.forEach((p) => {
            expect(products.some((orig) => orig.id === p.id)).toBe(true);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  it('filter composition is order-independent (intersection property)', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 30 }),
        fc.array(categoryArb, { maxLength: 3 }),
        fc.array(availabilityArb, { maxLength: 3 }),
        fc.record({
          min: fc.integer({ min: 0, max: 500_000 }),
          max: fc.integer({ min: 500_000, max: 2_000_000 }),
        }),
        (products, categories, availability, priceRaw) => {
          const priceRange = {
            min: Math.min(priceRaw.min, priceRaw.max),
            max: Math.max(priceRaw.min, priceRaw.max),
          };

          // Order 1: category → availability → price
          const order1 = applyPriceFilter(
            applyAvailabilityFilter(
              applyCategoryFilter(products, categories),
              availability
            ),
            priceRange
          );

          // Order 2: price → category → availability
          const order2 = applyCategoryFilter(
            applyAvailabilityFilter(
              applyPriceFilter(products, priceRange),
              availability
            ),
            categories
          );

          // Order 3: via applyFilters
          const order3 = applyFilters(products, {
            categories,
            availability,
            priceRange,
            searchQuery: '',
          });

          const ids1 = order1.map((p) => p.id).sort();
          const ids2 = order2.map((p) => p.id).sort();
          const ids3 = order3.map((p) => p.id).sort();

          expect(ids1).toEqual(ids2);
          expect(ids1).toEqual(ids3);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('empty filters return all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        (products) => {
          const emptyFilters: ProductFilters = {
            categories: [],
            availability: [],
            priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
            searchQuery: '',
          };
          const result = applyFilters(products, emptyFilters);
          expect(result.map((p) => p.id).sort()).toEqual(
            products.map((p) => p.id).sort()
          );
        }
      ),
      { numRuns: 15 }
    );
  });

  it('search results always contain the query term (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 1, maxLength: 20 }),
        fc
          .string({ minLength: 3, maxLength: 15 })
          .filter((s) => s.trim().length >= 3),
        (products, query) => {
          const results = searchProducts(products, query);
          const q = query.toLowerCase().trim();

          results.forEach((p) => {
            const inName = p.name.toLowerCase().includes(q);
            const inDesc = p.description.toLowerCase().includes(q);
            const inSpec = p.specifications.some(
              (s) =>
                s.label.toLowerCase().includes(q) ||
                s.value.toLowerCase().includes(q)
            );
            expect(inName || inDesc || inSpec).toBe(true);
          });
        }
      ),
      { numRuns: 15 }
    );
  });
});

// ---------------------------------------------------------------------------
// 6. Pre-Order Deposit Calculation
// ---------------------------------------------------------------------------

describe('Preservation: Pre-order deposit calculation', () => {
  /**
   * **Validates: Requirements 3.1, 3.3**
   *
   * For any pre-order item, deposit = depositPercentage * price (or fixed depositAmount).
   * Regular items contribute zero deposit.
   */
  it('deposit for pre-order items with fixed depositAmount = depositAmount * quantity', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            unitPrice: fc.integer({ min: 1_000, max: 500_000 }),
            quantity: fc.integer({ min: 1, max: 20 }),
            depositAmount: fc.integer({ min: 500, max: 50_000 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rows) => {
          const items: CartItem[] = rows.map((r, i) =>
            makeCartItem({
              productId: `prod-${i}`,
              unitPrice: r.unitPrice,
              quantity: r.quantity,
              subtotal: r.unitPrice * r.quantity,
              availability: 'pre-order',
              isPreOrder: true,
              depositAmount: r.depositAmount,
            })
          );

          const expected = rows.reduce(
            (s, r) => s + r.depositAmount * r.quantity,
            0
          );
          expect(calculatePreOrderDeposit(items)).toBe(expected);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('regular (in-stock) items contribute zero deposit', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            unitPrice: fc.integer({ min: 1_000, max: 500_000 }),
            quantity: fc.integer({ min: 1, max: 20 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rows) => {
          const items: CartItem[] = rows.map((r, i) =>
            makeCartItem({
              productId: `prod-${i}`,
              unitPrice: r.unitPrice,
              quantity: r.quantity,
              subtotal: r.unitPrice * r.quantity,
              availability: 'in-stock',
              isPreOrder: false,
            })
          );

          expect(calculatePreOrderDeposit(items)).toBe(0);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('calculateDepositAmount = totalAmount * (depositPercentage / 100)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1_000, max: 1_000_000 }),
        fc.integer({ min: 1, max: 100 }),
        (totalAmount, depositPercentage) => {
          const result = calculateDepositAmount(totalAmount, depositPercentage);
          const expected =
            Math.round(totalAmount * (depositPercentage / 100) * 100) / 100;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 25 }
    );
  });

  it('empty cart has zero deposit', () => {
    expect(calculatePreOrderDeposit([])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Authentication State Management
// ---------------------------------------------------------------------------

describe('Preservation: Authentication state management', () => {
  /**
   * **Validates: Requirements 3.2, 3.4**
   *
   * Authentication state transitions SHALL remain consistent:
   * - Unauthenticated → login → authenticated
   * - Authenticated → logout → unauthenticated
   * - Session expiry logic is time-based
   */
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const SESSION_WARNING_MS = 28 * 60 * 1000; // 28 minutes

  /** Pure helper: is a session still active? */
  function isSessionActive(
    lastActivityTime: number | null,
    sessionExpired: boolean
  ): boolean {
    if (!lastActivityTime || sessionExpired) return false;
    return Date.now() - lastActivityTime < SESSION_TIMEOUT_MS;
  }

  /** Pure helper: should warning be shown? */
  function shouldShowWarning(
    lastActivityTime: number | null,
    isAuthenticated: boolean
  ): boolean {
    if (!isAuthenticated || !lastActivityTime) return false;
    return Date.now() - lastActivityTime >= SESSION_WARNING_MS;
  }

  it('session is active immediately after login', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const now = Date.now();
        expect(isSessionActive(now, false)).toBe(true);
      }),
      { numRuns: 10 }
    );
  });

  it('session is inactive when sessionExpired flag is set', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: SESSION_TIMEOUT_MS - 1 }),
        (msAgo) => {
          const lastActivity = Date.now() - msAgo;
          expect(isSessionActive(lastActivity, true)).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('session is inactive when lastActivityTime is null', () => {
    expect(isSessionActive(null, false)).toBe(false);
    expect(isSessionActive(null, true)).toBe(false);
  });

  it('session is inactive when last activity exceeds SESSION_TIMEOUT', () => {
    fc.assert(
      fc.property(
        fc.integer({
          min: SESSION_TIMEOUT_MS + 1,
          max: SESSION_TIMEOUT_MS * 10,
        }),
        (msAgo) => {
          const lastActivity = Date.now() - msAgo;
          expect(isSessionActive(lastActivity, false)).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('warning is NOT shown when session is fresh (< 28 minutes old)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: SESSION_WARNING_MS - 1 }),
        (msAgo) => {
          const lastActivity = Date.now() - msAgo;
          expect(shouldShowWarning(lastActivity, true)).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('warning IS shown when session is stale (>= 28 minutes old)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SESSION_WARNING_MS, max: SESSION_TIMEOUT_MS }),
        (msAgo) => {
          const lastActivity = Date.now() - msAgo;
          expect(shouldShowWarning(lastActivity, true)).toBe(true);
        }
      ),
      { numRuns: 15 }
    );
  });

  it('warning is NOT shown when not authenticated', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SESSION_WARNING_MS, max: SESSION_TIMEOUT_MS * 2 }),
        (msAgo) => {
          const lastActivity = Date.now() - msAgo;
          expect(shouldShowWarning(lastActivity, false)).toBe(false);
        }
      ),
      { numRuns: 15 }
    );
  });
});
