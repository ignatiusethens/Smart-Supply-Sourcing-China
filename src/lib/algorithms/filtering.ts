import { Product, ProductFilters, Category, AvailabilityStatus } from '@/types';

// Apply filters to products array (client-side filtering)
export function applyFilters(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let filtered = products;

  // Category filter
  if (filters.categories.length > 0) {
    filtered = filtered.filter(p => 
      filters.categories.includes(p.category)
    );
  }

  // Availability filter
  if (filters.availability.length > 0) {
    filtered = filtered.filter(p => 
      filters.availability.includes(p.availability)
    );
  }

  // Price range filter
  filtered = filtered.filter(p => 
    p.price >= filters.priceRange.min && 
    p.price <= filters.priceRange.max
  );

  // Search query filter
  if (filters.searchQuery) {
    filtered = searchProducts(filtered, filters.searchQuery);
  }

  return filtered;
}

// Individual filter functions for composability
export function applyCategoryFilter(
  products: Product[],
  categories: Category[]
): Product[] {
  if (categories.length === 0) return products;
  return products.filter(p => categories.includes(p.category));
}

export function applyAvailabilityFilter(
  products: Product[],
  availability: AvailabilityStatus[]
): Product[] {
  if (availability.length === 0) return products;
  return products.filter(p => availability.includes(p.availability));
}

export function applyPriceFilter(
  products: Product[],
  priceRange: { min: number; max: number }
): Product[] {
  return products.filter(p => 
    p.price >= priceRange.min && p.price <= priceRange.max
  );
}

// Search products by query
export function searchProducts(
  products: Product[],
  query: string
): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return products;

  return products.filter(product => {
    // Search in product name
    const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
    
    // Search in specifications
    const specMatch = product.specifications.some(spec =>
      spec.label.toLowerCase().includes(normalizedQuery) ||
      spec.value.toLowerCase().includes(normalizedQuery)
    );
    
    // Search in description
    const descMatch = product.description.toLowerCase().includes(normalizedQuery);
    
    return nameMatch || specMatch || descMatch;
  });
}

// Fuzzy search with Levenshtein distance for typo tolerance
export function fuzzySearchProducts(
  products: Product[],
  query: string,
  threshold: number = 2
): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return products;

  return products.filter(product => {
    // Exact match first
    const exactMatch = searchProducts([product], query).length > 0;
    if (exactMatch) return true;

    // Fuzzy match on product name
    const nameDistance = levenshteinDistance(
      product.name.toLowerCase(),
      normalizedQuery
    );
    
    if (nameDistance <= threshold) return true;

    // Fuzzy match on specifications
    const specFuzzyMatch = product.specifications.some(spec => {
      const labelDistance = levenshteinDistance(
        spec.label.toLowerCase(),
        normalizedQuery
      );
      const valueDistance = levenshteinDistance(
        spec.value.toLowerCase(),
        normalizedQuery
      );
      
      return labelDistance <= threshold || valueDistance <= threshold;
    });

    return specFuzzyMatch;
  });
}

// Levenshtein distance calculation for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first row and column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Sort products by relevance score
export function sortByRelevance(
  products: Product[],
  query: string
): Product[] {
  if (!query.trim()) return products;

  const normalizedQuery = query.toLowerCase().trim();

  return products
    .map(product => ({
      product,
      score: calculateRelevanceScore(product, normalizedQuery)
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

function calculateRelevanceScore(product: Product, query: string): number {
  let score = 0;

  // Exact name match gets highest score
  if (product.name.toLowerCase() === query) {
    score += 100;
  } else if (product.name.toLowerCase().includes(query)) {
    score += 50;
  }

  // Description match
  if (product.description.toLowerCase().includes(query)) {
    score += 20;
  }

  // Specification matches
  product.specifications.forEach(spec => {
    if (spec.label.toLowerCase().includes(query)) {
      score += 15;
    }
    if (spec.value.toLowerCase().includes(query)) {
      score += 10;
    }
  });

  // Category match
  if (product.category.toLowerCase().includes(query)) {
    score += 25;
  }

  return score;
}