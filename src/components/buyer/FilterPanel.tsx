'use client';

import React from 'react';
import { ProductFilters, Category, AvailabilityStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/utils/constants';

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

  const allProductsSelected = filters.categories.length === 0;

  const handleAllProductsToggle = () => {
    onFilterChange({ ...filters, categories: [] });
  };

  const handleCategoryToggle = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleAvailabilityToggle = (availability: AvailabilityStatus) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter((a) => a !== availability)
      : [...filters.availability, availability];
    onFilterChange({ ...filters, availability: newAvailability });
  };

  const handleLeadTimeToggle = (option: LeadTimeOption) => {
    setLeadTime((prev) =>
      prev.includes(option)
        ? prev.filter((l) => l !== option)
        : [...prev, option]
    );
  };

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue =
      value === '' ? (field === 'min' ? 0 : priceRange.max) : Number(value);
    onFilterChange({
      ...filters,
      priceRange: { ...filters.priceRange, [field]: numValue },
    });
  };

  const handleReset = () => {
    setLeadTime([]);
    onFilterChange({
      categories: [],
      availability: [],
      priceRange: { min: 0, max: priceRange.max },
      searchQuery: '',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800">Filters</h2>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-[#1a6b50] hover:text-[#155a42] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50] rounded px-1"
          aria-label="Reset all filters"
        >
          Reset
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* CATEGORY */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Category
          </p>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={allProductsSelected}
                onChange={handleAllProductsToggle}
                className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                aria-label="Show all product categories"
              />
              <span
                className={`text-sm font-medium ${allProductsSelected ? 'text-[#1a6b50]' : 'text-gray-700 group-hover:text-gray-900'}`}
              >
                All Products
              </span>
            </label>
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
                  className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                  aria-label={`Filter by ${CATEGORY_LABELS[category]}`}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* AVAILABILITY */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Availability
          </p>
          <div className="space-y-2.5">
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
                  className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                  aria-label={`Filter by ${label}`}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* LEAD TIME */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Lead Time
          </p>
          <div className="space-y-2.5">
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
                  className="w-4 h-4 rounded border-gray-300 text-[#1a6b50] focus:ring-[#1a6b50] cursor-pointer"
                  aria-label={`Filter by lead time: ${label}`}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* PRICE RANGE */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Price Range
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label
                htmlFor="price-min"
                className="text-xs text-gray-400 mb-1 block"
              >
                MIN
              </label>
              <Input
                id="price-min"
                type="number"
                min={0}
                value={
                  filters.priceRange.min === 0 ? '' : filters.priceRange.min
                }
                placeholder="0"
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="h-8 text-sm border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                aria-label="Minimum price"
              />
            </div>
            <span className="text-gray-300 mt-5 text-sm">—</span>
            <div className="flex-1">
              <label
                htmlFor="price-max"
                className="text-xs text-gray-400 mb-1 block"
              >
                MAX
              </label>
              <Input
                id="price-max"
                type="number"
                min={0}
                value={
                  filters.priceRange.max === priceRange.max
                    ? ''
                    : filters.priceRange.max
                }
                placeholder="Any"
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="h-8 text-sm border-gray-200 bg-gray-50 focus-visible:ring-[#1a6b50] focus-visible:border-[#1a6b50] rounded-lg"
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info + CTA */}
      <div className="px-5 py-5 border-t border-gray-100 bg-[#f0faf6]">
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          M-Pesa payments clear instantly. Bank transfers take 1–3 business
          days.
        </p>
        <button
          onClick={onRequestPriceList}
          className="w-full py-2 text-xs font-semibold text-[#1a6b50] border border-[#1a6b50] rounded-lg hover:bg-[#e8f4f0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a6b50]"
          aria-label="Request full price list"
        >
          Request Full Price List
        </button>
      </div>
    </div>
  );
}
