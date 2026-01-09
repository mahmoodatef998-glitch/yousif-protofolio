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
import { ScrollProgress } from '@/components/ScrollProgress';
import { BackToTop } from '@/components/BackToTop';
import { usePageLoad } from '@/lib/animations';

export default function Home() {
  const mounted = usePageLoad();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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
      <section id="portfolio-filter" className="py-12 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Portfolio
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Explore our work across different categories
            </p>
          </div>
          <PortfolioFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </section>
      
      {/* Videos Section - 4 full-screen videos */}
      {(activeFilter === 'all' || activeFilter === 'videos') && <Videos />}
      
      {/* Reels Section - 5 reels */}
      {(activeFilter === 'all' || activeFilter === 'reels') && <Reels />}
      
      {/* Wedding Section */}
      {(activeFilter === 'all' || activeFilter === 'wedding') && <Wedding />}
      
      {/* Product Section */}
      {(activeFilter === 'all' || activeFilter === 'product') && <Product />}
      
      {/* Restaurant Section */}
      {(activeFilter === 'all' || activeFilter === 'restaurant') && <Restaurant />}
      
      {/* Testimonials Section - What Clients Say */}
      <Testimonials />
      
      {/* Contact Section */}
      <Contact />
    </main>
  );
}
