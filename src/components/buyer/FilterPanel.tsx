'use client';

import React from 'react';
import { ProductFilters, Category, AvailabilityStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/utils/constants';
import { formatCurrency } from '@/lib/utils/formatting';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  priceRange?: { min: number; max: number };
}

export function FilterPanel({
  filters,
  onFilterChange,
  priceRange = { min: 0, max: 1000000 },
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleCategoryToggle = (category: Category) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];

    const updated = { ...localFilters, categories: newCategories };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleAvailabilityToggle = (availability: AvailabilityStatus) => {
    const newAvailability = localFilters.availability.includes(availability)
      ? localFilters.availability.filter(a => a !== availability)
      : [...localFilters.availability, availability];

    const updated = { ...localFilters, availability: newAvailability };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceChange = (field: 'min' | 'max', value: number) => {
    const newPriceRange = { ...localFilters.priceRange, [field]: value };
    const updated = { ...localFilters, priceRange: newPriceRange };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleSearchChange = (query: string) => {
    const updated = { ...localFilters, searchQuery: query };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleClearAll = () => {
    const cleared: ProductFilters = {
      categories: [],
      availability: [],
      priceRange: { min: 0, max: priceRange.max },
      searchQuery: '',
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    localFilters.categories.length > 0 ||
    localFilters.availability.length > 0 ||
    localFilters.searchQuery.length > 0 ||
    localFilters.priceRange.min > 0 ||
    localFilters.priceRange.max < priceRange.max;

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {/* Search */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base md:text-lg">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            id="product-search"
            placeholder="Search products..."
            value={localFilters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="text-sm sm:text-base h-10 sm:h-11 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Search products by name or specifications"
          />
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base md:text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-2.5">
          {CATEGORIES.map((category) => (
            <label 
              key={category} 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer p-1 sm:p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-blue-500"
            >
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={localFilters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label={`Filter by ${category.replace('-', ' ')} category`}
              />
              <span className="text-xs sm:text-sm md:text-base capitalize">
                {category.replace('-', ' ')}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base md:text-lg">Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-2.5">
          {(['in-stock', 'pre-order', 'out-of-stock'] as AvailabilityStatus[]).map(
            (availability) => (
              <label 
                key={availability} 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer p-1 sm:p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-blue-500"
              >
                <input
                  type="checkbox"
                  id={`availability-${availability}`}
                  checked={localFilters.availability.includes(availability)}
                  onChange={() => handleAvailabilityToggle(availability)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label={`Filter by ${availability.replace('-', ' ')} availability`}
                />
                <span className="text-xs sm:text-sm md:text-base capitalize">
                  {availability.replace('-', ' ')}
                </span>
              </label>
            )
          )}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base md:text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div>
            <label 
              htmlFor="min-price"
              className="text-xs sm:text-sm font-medium"
            >
              Min Price
            </label>
            <Input
              id="min-price"
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={localFilters.priceRange.min}
              onChange={(e) => handlePriceChange('min', Number(e.target.value))}
              className="mt-1 sm:mt-1.5 text-sm sm:text-base h-10 sm:h-11 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              aria-label="Minimum price filter"
            />
            <p className="text-xs text-slate-500 mt-1 sm:mt-1.5">
              {formatCurrency(localFilters.priceRange.min)}
            </p>
          </div>

          <div>
            <label 
              htmlFor="max-price"
              className="text-xs sm:text-sm font-medium"
            >
              Max Price
            </label>
            <Input
              id="max-price"
              type="number"
              min={priceRange.min}
              max={priceRange.max}
              value={localFilters.priceRange.max}
              onChange={(e) => handlePriceChange('max', Number(e.target.value))}
              className="mt-1 sm:mt-1.5 text-sm sm:text-base h-10 sm:h-11 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              aria-label="Maximum price filter"
            />
            <p className="text-xs text-slate-500 mt-1 sm:mt-1.5">
              {formatCurrency(localFilters.priceRange.max)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium">Active Filters</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearAll}
                className="h-auto p-0 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-label="Clear all active filters"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="gap-1 text-xs sm:text-sm">
                  {cat.replace('-', ' ')}
                  <button
                    onClick={() => handleCategoryToggle(cat)}
                    className="ml-1 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 rounded"
                    aria-label={`Remove ${cat} filter`}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
              {localFilters.availability.map((avail) => (
                <Badge key={avail} variant="secondary" className="gap-1 text-xs sm:text-sm">
                  {avail.replace('-', ' ')}
                  <button
                    onClick={() => handleAvailabilityToggle(avail)}
                    className="ml-1 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 rounded"
                    aria-label={`Remove ${avail} filter`}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                  </button>
                </Badge>
              ))}
              {localFilters.searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm">
                  Search: {localFilters.searchQuery}
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-1 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 rounded"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}