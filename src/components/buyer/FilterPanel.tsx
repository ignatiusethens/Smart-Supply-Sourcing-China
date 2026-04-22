'use client';

import React from 'react';
import { ProductFilters, Category, AvailabilityStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/utils/constants';

// Lead time filter options (UI-only, used for display/UX)
export type LeadTimeOption = 'instant' | 'within-7-days' | 'extended-14-plus';

interface FilterPanelProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  priceRange?: { min: number; max: number };
  onRequestPriceList?: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  'pumps-motors': 'Pumps & Motors',
  'energy-systems': 'Energy Systems',
  'fluid-control': 'Fluid Control',
  electrical: 'Electrical',
  storage: 'Storage',
};

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'in-stock', label: 'Ready Stock (M-Pesa)' },
  { value: 'pre-order', label: 'Pre-order (Bank)' },
];

const LEAD_TIME_OPTIONS: { value: LeadTimeOption; label: string }[] = [
  { value: 'instant', label: 'Instant Dispatch' },
  { value: 'within-7-days', label: 'Within 7 Days' },
  { value: 'extended-14-plus', label: 'Extended (14+ Days)' },
];

export function FilterPanel({
  filters,
  onFilterChange,
  priceRange = { min: 0, max: 1000000 },
  onRequestPriceList,
}: FilterPanelProps) {
  const [leadTime, setLeadTime] = React.useState<LeadTimeOption[]>([]);

  // Derive state from props instead of maintaining local state
  const allProductsSelected = filters.categories.length === 0;

  const handleAllProductsToggle = () => {
    const cleared = { ...filters, categories: [] };
    onFilterChange(cleared);
  };

  const handleCategoryToggle = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const updated = { ...filters, categories: newCategories };
    onFilterChange(updated);
  };

  const handleAvailabilityToggle = (availability: AvailabilityStatus) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter((a) => a !== availability)
      : [...filters.availability, availability];

    const updated = { ...filters, availability: newAvailability };
    onFilterChange(updated);
  };

  const handleLeadTimeToggle = (option: LeadTimeOption) => {
    setLeadTime((prev) =>
      prev.includes(option)
        ? prev.filter((l) => l !== option)
        : [...prev, option]
    );
    // Lead time is a UI-only filter for now; extend ProductFilters if backend support is added
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue =
      value === '' ? (field === 'min' ? 0 : priceRange.max) : Number(value);
    const newPriceRange = { ...filters.priceRange, [field]: numValue };
    const updated = { ...filters, priceRange: newPriceRange };
    onFilterChange(updated);
  };

  const handleReset = () => {
    const cleared: ProductFilters = {
      categories: [],
      availability: [],
      priceRange: { min: 0, max: priceRange.max },
      searchQuery: '',
    };
    setLeadTime([]);
    onFilterChange(cleared);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-200">
        <h2 className="text-sm font-semibold text-primary-800">Filters</h2>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-info-600 hover:text-info-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-500 rounded px-1"
          aria-label="Reset all filters"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* CATEGORY */}
        <div className="px-4 py-4 border-b border-primary-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-3">
            Category
          </p>
          <div className="space-y-2">
            {/* All Products */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={allProductsSelected}
                onChange={handleAllProductsToggle}
                className="w-4 h-4 rounded border-primary-300 text-info-600 focus-visible:ring-2 focus-visible:ring-info-500 cursor-pointer"
                aria-label="Show all product categories"
              />
              <span
                className={`text-sm font-medium ${
                  allProductsSelected
                    ? 'text-info-600'
                    : 'text-primary-700 group-hover:text-primary-900'
                }`}
              >
                All Products
              </span>
            </label>

            {/* Individual categories */}
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 rounded border-primary-300 text-info-600 focus-visible:ring-2 focus-visible:ring-info-500 cursor-pointer"
                  aria-label={`Filter by ${CATEGORY_LABELS[category]} category`}
                />
                <span className="text-sm text-primary-700 group-hover:text-primary-900">
                  {CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* AVAILABILITY */}
        <div className="px-4 py-4 border-b border-primary-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-3">
            Availability
          </p>
          <div className="space-y-2">
            {AVAILABILITY_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  id={`availability-${value}`}
                  checked={filters.availability.includes(value)}
                  onChange={() => handleAvailabilityToggle(value)}
                  className="w-4 h-4 rounded border-primary-300 text-info-600 focus-visible:ring-2 focus-visible:ring-info-500 cursor-pointer"
                  aria-label={`Filter by ${label}`}
                />
                <span className="text-sm text-primary-700 group-hover:text-primary-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* LEAD TIME */}
        <div className="px-4 py-4 border-b border-primary-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-3">
            Lead Time
          </p>
          <div className="space-y-2">
            {LEAD_TIME_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  id={`lead-time-${value}`}
                  checked={leadTime.includes(value)}
                  onChange={() => handleLeadTimeToggle(value)}
                  className="w-4 h-4 rounded border-primary-300 text-info-600 focus-visible:ring-2 focus-visible:ring-info-500 cursor-pointer"
                  aria-label={`Filter by lead time: ${label}`}
                />
                <span className="text-sm text-primary-700 group-hover:text-primary-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* PRICE RANGE */}
        <div className="px-4 py-4 border-b border-primary-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-3">
            Price Range
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label
                htmlFor="price-min"
                className="text-xs text-primary-500 mb-1 block"
              >
                MIN
              </label>
              <Input
                id="price-min"
                type="number"
                min={0}
                max={priceRange.max}
                value={
                  filters.priceRange.min === 0 ? '' : filters.priceRange.min
                }
                placeholder="0"
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="h-8 text-sm border-primary-300 focus-visible:ring-info-500"
                aria-label="Minimum price filter"
              />
            </div>
            <span className="text-primary-400 mt-5">—</span>
            <div className="flex-1">
              <label
                htmlFor="price-max"
                className="text-xs text-primary-500 mb-1 block"
              >
                MAX
              </label>
              <Input
                id="price-max"
                type="number"
                min={0}
                max={priceRange.max}
                value={
                  filters.priceRange.max === priceRange.max
                    ? ''
                    : filters.priceRange.max
                }
                placeholder="Any"
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="h-8 text-sm border-primary-300 focus-visible:ring-info-500"
                aria-label="Maximum price filter"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info box */}
      <div className="px-4 py-4 border-t border-primary-200 bg-primary-50">
        <p className="text-xs text-primary-500 mb-3 leading-relaxed">
          M-Pesa payments are cleared instantly. Bank transfers may take 1–3
          business days.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-primary-300 text-primary-600 hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-info-500"
          onClick={onRequestPriceList}
          aria-label="Request full price list"
        >
          Request Full Price List
        </Button>
      </div>
    </div>
  );
}
