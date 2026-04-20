import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { 
  applyFilters, 
  applyCategoryFilter, 
  applyAvailabilityFilter, 
  applyPriceFilter,
  searchProducts 
} from '@/lib/algorithms/filtering';
import { Product, ProductFilters, Category, AvailabilityStatus, Specification } from '@/types';

/**
 * Property-Based Tests for Filtering Algorithms
 * 
 * **Property 1: Filter Composition Consistency**
 * **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 20.2**
 * 
 * **Property 5: Search Result Relevance**
 * **Validates: Requirements 1.7, 20.3**
 */

// Arbitraries for generating test data
const categoryArbitrary = fc.constantFrom<Category>(
  'pumps-motors', 
  'energy-systems', 
  'fluid-control', 
  'electrical', 
  'storage'
);

const availabilityArbitrary = fc.constantFrom<AvailabilityStatus>(
  'in-stock', 
  'pre-order', 
  'out-of-stock'
);

const specificationArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  productId: fc.string({ minLength: 1, maxLength: 20 }),
  label: fc.string({ minLength: 1, maxLength: 30 }),
  value: fc.string({ minLength: 1, maxLength: 50 })
});

const productArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  category: categoryArbitrary,
  price: fc.integer({ min: 1000, max: 2000000 }), // KES 1k to 2M
  availability: availabilityArbitrary,
  stockLevel: fc.integer({ min: 0, max: 1000 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  imageUrls: fc.array(fc.webUrl(), { maxLength: 5 }),
  specifications: fc.array(specificationArbitrary, { maxLength: 10 }),
  createdAt: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
  updatedAt: fc.constantFrom('2024-01-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', '2024-12-01T00:00:00.000Z'),
  warrantyDuration: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  warrantyTerms: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  depositAmount: fc.option(fc.integer({ min: 1000, max: 100000 })),
  depositPercentage: fc.option(fc.integer({ min: 10, max: 50 })),
  batchArrivalDate: fc.option(fc.constantFrom('2025-01-01T00:00:00.000Z', '2025-06-01T00:00:00.000Z')),
  escrowDetails: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
});

// Helper function to create a complete Product object
function createProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    price: data.price,
    availability: data.availability,
    stockLevel: data.stockLevel,
    description: data.description,
    imageUrls: data.imageUrls,
    specifications: data.specifications.map((spec: any) => ({
      ...spec,
      productId: data.id
    })),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    warrantyDuration: data.warrantyDuration,
    warrantyTerms: data.warrantyTerms,
    depositAmount: data.depositAmount,
    depositPercentage: data.depositPercentage,
    batchArrivalDate: data.batchArrivalDate,
    escrowDetails: data.escrowDetails
  };
}

// Arbitrary for generating product filters
const productFiltersArbitrary = fc.record({
  categories: fc.array(categoryArbitrary, { maxLength: 5 }),
  availability: fc.array(availabilityArbitrary, { maxLength: 3 }),
  priceRange: fc.record({
    min: fc.integer({ min: 0, max: 1000000 }),
    max: fc.integer({ min: 1000000, max: 2000000 })
  }),
  searchQuery: fc.string({ maxLength: 50 })
});

describe('Product Filtering Properties', () => {
  
  /**
   * Property 1: Filter Composition Consistency
   * 
   * For any product catalog and any combination of filters (category, availability, price range), 
   * applying filters in any order SHALL produce the same result set.
   * 
   * **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 20.2**
   */
  it('Property 1: Filter composition is order-independent', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 50 }),
        fc.array(categoryArbitrary, { maxLength: 3 }),
        fc.array(availabilityArbitrary, { maxLength: 3 }),
        fc.record({
          min: fc.integer({ min: 0, max: 1000000 }),
          max: fc.integer({ min: 1000000, max: 2000000 })
        }),
        (productData, categories, availability, priceRange) => {
          const products = productData.map(createProduct);
          
          // Ensure min <= max for price range
          const validPriceRange = {
            min: Math.min(priceRange.min, priceRange.max),
            max: Math.max(priceRange.min, priceRange.max)
          };
          
          const filters: ProductFilters = {
            categories,
            availability,
            priceRange: validPriceRange,
            searchQuery: '' // No search for this test
          };
          
          // Apply filters using the main function
          const result1 = applyFilters(products, filters);
          
          // Apply filters in different order: price -> availability -> category
          const result2 = applyCategoryFilter(
            applyAvailabilityFilter(
              applyPriceFilter(products, validPriceRange),
              availability
            ),
            categories
          );
          
          // Apply filters in another order: availability -> category -> price
          const result3 = applyPriceFilter(
            applyCategoryFilter(
              applyAvailabilityFilter(products, availability),
              categories
            ),
            validPriceRange
          );
          
          // All results should be identical (same products, same order)
          expect(result1.map(p => p.id).sort()).toEqual(result2.map(p => p.id).sort());
          expect(result1.map(p => p.id).sort()).toEqual(result3.map(p => p.id).sort());
          expect(result2.map(p => p.id).sort()).toEqual(result3.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: Empty filters return all products
   * 
   * When no filters are applied, all products should be returned.
   */
  it('Property 1b: Empty filters return all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 20 }),
        (productData) => {
          const products = productData.map(createProduct);
          
          const emptyFilters: ProductFilters = {
            categories: [],
            availability: [],
            priceRange: { min: 0, max: Number.MAX_SAFE_INTEGER },
            searchQuery: ''
          };
          
          const result = applyFilters(products, emptyFilters);
          
          // Should return all products
          expect(result.length).toBe(products.length);
          expect(result.map(p => p.id).sort()).toEqual(products.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1c: Filter results are subsets of original
   * 
   * Any filtered result should be a subset of the original product list.
   */
  it('Property 1c: Filter results are subsets of original products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 30 }),
        productFiltersArbitrary,
        (productData, filtersData) => {
          const products = productData.map(createProduct);
          
          // Ensure valid price range
          const filters: ProductFilters = {
            ...filtersData,
            priceRange: {
              min: Math.min(filtersData.priceRange.min, filtersData.priceRange.max),
              max: Math.max(filtersData.priceRange.min, filtersData.priceRange.max)
            }
          };
          
          const result = applyFilters(products, filters);
          
          // Result should be a subset of original products
          expect(result.length).toBeLessThanOrEqual(products.length);
          
          // Every result product should exist in original products
          result.forEach(resultProduct => {
            expect(products.some(p => p.id === resultProduct.id)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Search Result Relevance
   * 
   * For any search query and product catalog, all returned products SHALL contain 
   * the search term in either the product name, specifications, or description (case-insensitive).
   * 
   * **Validates: Requirements 1.7, 20.3**
   */
  it('Property 5: Search results contain query term', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
        (productData, query) => {
          const products = productData.map(createProduct);
          const normalizedQuery = query.toLowerCase().trim();
          
          const results = searchProducts(products, query);
          
          // Every result should contain the query term
          results.forEach(product => {
            const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
            const descMatch = product.description.toLowerCase().includes(normalizedQuery);
            const specMatch = product.specifications.some(spec =>
              spec.label.toLowerCase().includes(normalizedQuery) ||
              spec.value.toLowerCase().includes(normalizedQuery)
            );
            
            // At least one of these should be true
            expect(nameMatch || descMatch || specMatch).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5b: Empty search returns all products
   * 
   * When search query is empty or whitespace, all products should be returned.
   */
  it('Property 5b: Empty search returns all products', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 0, maxLength: 20 }),
        fc.constantFrom('', '   ', '\t', '\n'),
        (productData, emptyQuery) => {
          const products = productData.map(createProduct);
          
          const results = searchProducts(products, emptyQuery);
          
          // Should return all products
          expect(results.length).toBe(products.length);
          expect(results.map(p => p.id).sort()).toEqual(products.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5c: Search is case-insensitive
   * 
   * Search should work regardless of case in query or product data.
   */
  it('Property 5c: Search is case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 15 }).filter(s => s.trim().length >= 3),
        (productData, query) => {
          const products = productData.map(createProduct);
          
          const lowerResults = searchProducts(products, query.toLowerCase());
          const upperResults = searchProducts(products, query.toUpperCase());
          const mixedResults = searchProducts(products, query);
          
          // All should return the same results
          expect(lowerResults.map(p => p.id).sort()).toEqual(upperResults.map(p => p.id).sort());
          expect(lowerResults.map(p => p.id).sort()).toEqual(mixedResults.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5d: Search results are deterministic
   * 
   * Multiple searches with the same query should return identical results.
   */
  it('Property 5d: Search results are deterministic', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3),
        (productData, query) => {
          const products = productData.map(createProduct);
          
          const result1 = searchProducts(products, query);
          const result2 = searchProducts(products, query);
          const result3 = searchProducts(products, query);
          
          // All results should be identical
          expect(result1.map(p => p.id)).toEqual(result2.map(p => p.id));
          expect(result1.map(p => p.id)).toEqual(result3.map(p => p.id));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1d: Category filter correctness
   * 
   * When filtering by categories, only products with those categories should be returned.
   */
  it('Property 1d: Category filter returns only matching categories', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 30 }),
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 3 }),
        (productData, categories) => {
          const products = productData.map(createProduct);
          
          const result = applyCategoryFilter(products, categories);
          
          // Every result product should have a category in the filter
          result.forEach(product => {
            expect(categories.includes(product.category)).toBe(true);
          });
          
          // Every product with matching category should be in results (if any exist)
          const expectedProducts = products.filter(p => categories.includes(p.category));
          expect(result.map(p => p.id).sort()).toEqual(expectedProducts.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1e: Availability filter correctness
   * 
   * When filtering by availability, only products with those availability statuses should be returned.
   */
  it('Property 1e: Availability filter returns only matching availability', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 30 }),
        fc.array(availabilityArbitrary, { minLength: 1, maxLength: 3 }),
        (productData, availability) => {
          const products = productData.map(createProduct);
          
          const result = applyAvailabilityFilter(products, availability);
          
          // Every result product should have availability in the filter
          result.forEach(product => {
            expect(availability.includes(product.availability)).toBe(true);
          });
          
          // Every product with matching availability should be in results
          const expectedProducts = products.filter(p => availability.includes(p.availability));
          expect(result.map(p => p.id).sort()).toEqual(expectedProducts.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1f: Price filter correctness
   * 
   * When filtering by price range, only products within that range should be returned.
   */
  it('Property 1f: Price filter returns only products within range', () => {
    fc.assert(
      fc.property(
        fc.array(productArbitrary, { minLength: 1, maxLength: 30 }),
        fc.record({
          min: fc.integer({ min: 0, max: 1000000 }),
          max: fc.integer({ min: 1000000, max: 2000000 })
        }),
        (productData, priceRangeData) => {
          const products = productData.map(createProduct);
          const priceRange = {
            min: Math.min(priceRangeData.min, priceRangeData.max),
            max: Math.max(priceRangeData.min, priceRangeData.max)
          };
          
          const result = applyPriceFilter(products, priceRange);
          
          // Every result product should be within the price range
          result.forEach(product => {
            expect(product.price).toBeGreaterThanOrEqual(priceRange.min);
            expect(product.price).toBeLessThanOrEqual(priceRange.max);
          });
          
          // Every product within range should be in results
          const expectedProducts = products.filter(p => 
            p.price >= priceRange.min && p.price <= priceRange.max
          );
          expect(result.map(p => p.id).sort()).toEqual(expectedProducts.map(p => p.id).sort());
        }
      ),
      { numRuns: 100 }
    );
  });
});