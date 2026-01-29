'use client';

import { useState, useEffect } from 'react';

export type FilterType = string;

interface Section {
  id: string;
  name: string;
  display_order: number;
}

interface PortfolioFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const STATIC_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'product', label: 'Product' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'reels', label: 'Reels' },
  { id: 'videos', label: 'Videos' },
];

export function PortfolioFilter({ activeFilter, onFilterChange }: PortfolioFilterProps) {
  const [filters, setFilters] = useState<{ id: string; label: string }[]>(STATIC_FILTERS);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const { data } = await response.json();
      if (data) {
        const dynamicFilters = data
          .filter((s: any) => !STATIC_FILTERS.find(sf => sf.id === s.name.toLowerCase()) && s.name.toLowerCase() !== 'about' && s.name.toLowerCase() !== 'contact')
          .map((s: any) => ({
            id: s.name.toLowerCase(),
            label: s.name.charAt(0).toUpperCase() + s.name.slice(1)
          }));

        setFilters([...STATIC_FILTERS, ...dynamicFilters]);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchSections();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sections-updated');
      channel.onmessage = (event) => {
        if (event.data.type === 'sections-updated') {
          fetchSections();
        }
      };
      return () => channel.close();
    }
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12 px-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 btn-magnetic ${activeFilter === filter.id
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

