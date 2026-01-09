'use client';

import { useState } from 'react';

export type FilterType = 'all' | 'wedding' | 'product' | 'restaurant' | 'reels' | 'videos';

interface PortfolioFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'product', label: 'Product' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'reels', label: 'Reels' },
  { id: 'videos', label: 'Videos' },
];

export function PortfolioFilter({ activeFilter, onFilterChange }: PortfolioFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12 px-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 btn-magnetic ${
            activeFilter === filter.id
              ? 'bg-accent text-dark-bg scale-105'
              : 'bg-dark-section text-text-secondary hover:text-accent hover:bg-dark-section/80'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

