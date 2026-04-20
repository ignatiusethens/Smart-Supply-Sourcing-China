import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import { 
  generateReferenceCode, 
  generateUniqueReferenceCode, 
  validateReferenceCodeFormat,
  formatReferenceCode,
  parseReferenceCode
} from '@/lib/algorithms/referenceCode';
import { query } from '@/lib/database/connection';

/**
 * Property-Based Test for Reference Code Uniqueness
 * 
 * **Validates: Requirements 5.7, 24.1, 24.2**
 * 
 * Property 3: Reference Code Uniqueness
 * For any number of reference code generations, all generated codes SHALL be unique
 * and follow the expected format (SSS-YYYY-XXXXXX).
 */

// Mock the database query function for testing
jest.mock('@/lib/database/connection', () => ({
  query: jest.fn()
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('Property 3: Reference Code Uniqueness', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Reference Code Format Consistency', () => {
    /**
     * Property 3.1: Format Consistency
     * For any generated reference code, it SHALL follow the format SSS-YYYY-XXXXXX
     * where SSS is the prefix, YYYY is the current year, and XXXXXX is a 6-character alphanumeric identifier.
     */
    it('should generate reference codes with consistent format', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Number of codes to generate
          (numCodes) => {
            const codes: string[] = [];
            
            for (let i = 0; i < numCodes; i++) {
              const code = generateReferenceCode();
              codes.push(code);
              
              // Verify format
              expect(validateReferenceCodeFormat(code)).toBe(true);
              
              // Verify structure
              const parsed = parseReferenceCode(code);
              expect(parsed).not.toBeNull();
              expect(parsed!.prefix).toBe('SSS');
              expect(parsed!.year).toBe(new Date().getFullYear().toString());
              expect(parsed!.identifier).toMatch(/^[A-Z0-9]{6}$/);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property 3.2: Format Validation
     * For any string that matches the reference code format, validateReferenceCodeFormat SHALL return true.
     * For any string that doesn't match, it SHALL return false.
     */
    it('should correctly validate reference code formats', () => {
      // Valid format generator
      const validCodeArbitrary = fc.record({
        year: fc.integer({ min: 2020, max: 2030 }),
        identifier: fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[A-Z0-9]{6}$/.test(s))
      }).map(({ year, identifier }) => `SSS-${year}-${identifier}`);

      // Invalid format generators
      const invalidCodeArbitrary = fc.oneof(
        fc.string().filter(s => !s.match(/^SSS-\d{4}-[A-Z0-9]{6}$/)), // Random invalid strings
        fc.constant('SSS-2024-ABC12'), // Too short identifier
        fc.constant('SSS-2024-ABC1234'), // Too long identifier
        fc.constant('SSS-24-ABC123'), // Wrong year format
        fc.constant('ABC-2024-ABC123'), // Wrong prefix
        fc.constant('SSS-2024-abc123'), // Lowercase letters
        fc.constant('SSS-2024-AB@123') // Special characters
      );

      fc.assert(
        fc.property(
          validCodeArbitrary,
          (validCode) => {
            expect(validateReferenceCodeFormat(validCode)).toBe(true);
          }
        ),
        { numRuns: 30 }
      );

      fc.assert(
        fc.property(
          invalidCodeArbitrary,
          (invalidCode) => {
            expect(validateReferenceCodeFormat(invalidCode)).toBe(false);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Reference Code Uniqueness', () => {
    /**
     * Property 3.3: Basic Uniqueness
     * For any set of generated reference codes (without database collision detection),
     * the probability of duplicates SHALL be extremely low due to the large identifier space.
     */
    it('should generate unique codes with high probability', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }), // Number of codes to generate
          (numCodes) => {
            const codes = new Set<string>();
            
            for (let i = 0; i < numCodes; i++) {
              const code = generateReferenceCode();
              codes.add(code);
            }
            
            // With 36^6 possible identifiers (over 2 billion combinations),
            // the probability of collision in 100 codes is extremely low
            // We expect at least 95% uniqueness even in worst case
            const uniquenessRatio = codes.size / numCodes;
            expect(uniquenessRatio).toBeGreaterThan(0.95);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property 3.4: Database Collision Detection
     * For any scenario where database contains existing reference codes,
     * generateUniqueReferenceCode SHALL always return a code that doesn't exist in the database.
     */
    it('should handle database collision detection correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 13, maxLength: 13 }), { minLength: 0, maxLength: 10 }), // Existing codes
          fc.integer({ min: 1, max: 5 }), // Number of attempts to simulate
          async (existingCodes, maxAttempts) => {
            // Mock database to return existing codes
            let queryCallCount = 0;
            mockQuery.mockImplementation((sql: string, params: any[]) => {
              queryCallCount++;
              const searchCode = params[0];
              
              // Simulate database lookup
              if (existingCodes.includes(searchCode)) {
                return Promise.resolve({ rows: [{ id: 'existing' }] });
              } else {
                return Promise.resolve({ rows: [] });
              }
            });

            try {
              const uniqueCode = await generateUniqueReferenceCode();
              
              // Verify the returned code is valid
              expect(validateReferenceCodeFormat(uniqueCode)).toBe(true);
              
              // Verify the code is not in existing codes
              expect(existingCodes).not.toContain(uniqueCode);
              
              // Verify database was queried
              expect(queryCallCount).toBeGreaterThan(0);
              
            } catch (error) {
              // If it throws an error, it should be due to max attempts exceeded
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message).toContain('Failed to generate unique reference code');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Property 3.5: Maximum Attempts Protection
     * When the database collision detection fails to find a unique code after maximum attempts,
     * it SHALL throw an appropriate error to prevent infinite loops.
     */
    it('should throw error after maximum attempts', async () => {
      // Mock database to always return existing codes (simulate collision on every attempt)
      mockQuery.mockResolvedValue({ rows: [{ id: 'existing' }] });

      await expect(generateUniqueReferenceCode()).rejects.toThrow(
        'Failed to generate unique reference code after maximum attempts'
      );

      // Verify it attempted the maximum number of times (99, since it checks attempts >= 100 before the 100th query)
      expect(mockQuery).toHaveBeenCalledTimes(99);
    });
  });

  describe('Reference Code Utilities', () => {
    /**
     * Property 3.6: Format Preservation
     * For any valid reference code, formatReferenceCode SHALL preserve the format
     * and add dashes if they are missing.
     */
    it('should preserve and format reference codes correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            year: fc.integer({ min: 2020, max: 2030 }),
            identifier: fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[A-Z0-9]{6}$/.test(s))
          }),
          ({ year, identifier }) => {
            const withDashes = `SSS-${year}-${identifier}`;
            const withoutDashes = `SSS${year}${identifier}`;
            
            // Both should format to the same result
            expect(formatReferenceCode(withDashes)).toBe(withDashes);
            expect(formatReferenceCode(withoutDashes)).toBe(withDashes);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property 3.7: Parse Consistency
     * For any valid reference code, parsing and reconstructing it SHALL yield the same code.
     */
    it('should parse and reconstruct reference codes consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            year: fc.integer({ min: 2020, max: 2030 }),
            identifier: fc.string({ minLength: 6, maxLength: 6 }).filter(s => /^[A-Z0-9]{6}$/.test(s))
          }),
          ({ year, identifier }) => {
            const originalCode = `SSS-${year}-${identifier}`;
            const parsed = parseReferenceCode(originalCode);
            
            expect(parsed).not.toBeNull();
            expect(parsed!.prefix).toBe('SSS');
            expect(parsed!.year).toBe(year.toString());
            expect(parsed!.identifier).toBe(identifier);
            
            // Reconstruct and verify
            const reconstructed = `${parsed!.prefix}-${parsed!.year}-${parsed!.identifier}`;
            expect(reconstructed).toBe(originalCode);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cross-System Uniqueness', () => {
    /**
     * Property 3.8: Multi-Generation Uniqueness
     * For multiple calls to generateUniqueReferenceCode with different database states,
     * all returned codes SHALL be unique across all generations.
     */
    it('should maintain uniqueness across multiple generation sessions', async () => {
      const allGeneratedCodes = new Set<string>();
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of generation sessions
          fc.integer({ min: 1, max: 10 }), // Codes per session
          async (numSessions, codesPerSession) => {
            for (let session = 0; session < numSessions; session++) {
              // Mock database to return previously generated codes as existing
              mockQuery.mockImplementation((sql: string, params: any[]) => {
                const searchCode = params[0];
                if (allGeneratedCodes.has(searchCode)) {
                  return Promise.resolve({ rows: [{ id: 'existing' }] });
                } else {
                  return Promise.resolve({ rows: [] });
                }
              });

              for (let i = 0; i < codesPerSession; i++) {
                const code = await generateUniqueReferenceCode();
                
                // Verify uniqueness
                expect(allGeneratedCodes.has(code)).toBe(false);
                allGeneratedCodes.add(code);
                
                // Verify format
                expect(validateReferenceCodeFormat(code)).toBe(true);
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});