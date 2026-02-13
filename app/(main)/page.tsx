'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { About } from '@/components/About';
import { PortfolioFilter, FilterType } from '@/components/PortfolioFilter';
import { ScrollProgress } from '@/components/ScrollProgress';
import { BackToTop } from '@/components/BackToTop';
import { usePageLoad } from '@/lib/animations';

// Dynamic imports for below-the-fold components
const Videos = dynamic(() => import('@/components/Videos').then(mod => mod.Videos), {
  loading: () => <SectionSkeleton />
});
const Reels = dynamic(() => import('@/components/Reels').then(mod => mod.Reels), {
  loading: () => <SectionSkeleton />
});
const Wedding = dynamic(() => import('@/components/Wedding').then(mod => mod.Wedding), {
  loading: () => <SectionSkeleton />
});
const Product = dynamic(() => import('@/components/Product').then(mod => mod.Product), {
  loading: () => <SectionSkeleton />
});
const Restaurant = dynamic(() => import('@/components/Restaurant').then(mod => mod.Restaurant), {
  loading: () => <SectionSkeleton />
});
const DynamicGallery = dynamic(() => import('@/components/DynamicGallery').then(mod => mod.DynamicGallery), {
  loading: () => <SectionSkeleton />
});
const Testimonials = dynamic(() => import('@/components/Testimonials').then(mod => mod.Testimonials), {
  loading: () => <SectionSkeleton />
});
const Contact = dynamic(() => import('@/components/Contact').then(mod => mod.Contact), {
  loading: () => <SectionSkeleton />
});

function SectionSkeleton() {
  return (
    <div className="py-24 bg-dark-bg animate-pulse">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-12 w-48 bg-dark-section rounded-lg mx-auto mb-16"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-dark-section rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const mounted = usePageLoad();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sections, setSections] = useState<any[]>([]);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections', { cache: 'no-store' });
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
    // Smooth scrolling is now handled by Lenis, but we can still trigger it
    setTimeout(() => {
      const portfolioSection = document.querySelector('#portfolio-filter');
      if (portfolioSection) {
        portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <ScrollProgress />
      <BackToTop />

      {/* About Section - Hero at top */}
      <About />

      {/* Portfolio Filter */}
      <section id="portfolio-filter" className="py-16 sm:py-24 bg-dark-section relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-6xl font-bold text-text-primary mb-6 tracking-tight">
              Featured Work
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto px-4 font-medium opacity-80">
              A curated collection of visual stories across different mediums.
            </p>
          </motion.div>

          <PortfolioFilter
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </div>
      </section>

      {/* Portfolio Sections in Order */}
      <div className="relative min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Testimonials Section - What Clients Say */}
      <Testimonials />

      {/* Contact Section */}
      <Contact />
    </motion.main>
  );
}

