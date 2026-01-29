'use client';

import { useState } from 'react';
import { About } from '@/components/About';
import { Videos } from '@/components/Videos';
import { Reels } from '@/components/Reels';
import { Wedding } from '@/components/Wedding';
import { Product } from '@/components/Product';
import { Restaurant } from '@/components/Restaurant';
import { Contact } from '@/components/Contact';
import { Testimonials } from '@/components/Testimonials';
import { PortfolioFilter, FilterType } from '@/components/PortfolioFilter';
import { DynamicGallery } from '@/components/DynamicGallery';
import { ScrollProgress } from '@/components/ScrollProgress';
import { BackToTop } from '@/components/BackToTop';
import { usePageLoad } from '@/lib/animations';
import { useEffect } from 'react';

export default function Home() {
  const mounted = usePageLoad();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sections, setSections] = useState<any[]>([]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const { data } = await response.json();
      if (data) {
        setSections(data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // Smooth scroll to portfolio section
    setTimeout(() => {
      const portfolioSection = document.querySelector('#portfolio-filter');
      if (portfolioSection) {
        portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const STATIC_SECTION_NAMES = ['about', 'videos', 'reels', 'wedding', 'product', 'restaurant', 'contact'];

  return (
    <main
      className="transition-opacity-smooth"
      style={{
        opacity: mounted ? 1 : 0,
      }}
    >
      <ScrollProgress />
      <BackToTop />

      {/* About Section - Hero at top */}
      <About />

      {/* Portfolio Filter */}
      <section id="portfolio-filter" className="py-10 sm:py-12 md:py-16 bg-dark-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-3 md:mb-4">
              Portfolio
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto px-4">
              Explore our work across different categories
            </p>
          </div>
          <PortfolioFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </section>

      {/* Portfolio Sections in Order */}
      {sections
        .filter(s => s.is_active && !['about', 'contact'].includes(s.name.toLowerCase()))
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map(section => {
          const name = section.name.toLowerCase();
          const isVisible = activeFilter === 'all' || activeFilter === name;

          if (!isVisible) return null;

          switch (name) {
            case 'videos':
              return <Videos key={section.id} />;
            case 'reels':
              return <Reels key={section.id} />;
            case 'wedding':
              return <Wedding key={section.id} />;
            case 'product':
              return <Product key={section.id} />;
            case 'restaurant':
              return <Restaurant key={section.id} />;
            default:
              return (
                <DynamicGallery
                  key={section.id}
                  section={name}
                  title={section.name}
                />
              );
          }
        })
      }

      {/* Testimonials Section - What Clients Say */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />
    </main>
  );
}
