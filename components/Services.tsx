'use client';

import { useEffect, useRef, useState } from 'react';

const services = [
  {
    title: 'Wedding Photography',
    description: 'Capturing your special day with elegance and emotion',
  },
  {
    title: 'Portrait Sessions',
    description: 'Professional portraits that showcase your personality',
  },
  {
    title: 'Event Coverage',
    description: 'Documenting your events with precision and style',
  },
  {
    title: 'Commercial Photography',
    description: 'High-quality images for your business and brand',
  },
  {
    title: 'Videography',
    description: 'Cinematic video production for all occasions',
  },
  {
    title: 'Post-Production',
    description: 'Professional editing and color grading services',
  },
];

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className={`py-24 md:py-32 bg-dark-section transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
          Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="text-center group cursor-pointer"
            >
              <h3 className="text-2xl font-semibold text-text-primary mb-4 group-hover:text-accent transition-colors">
                {service.title}
              </h3>
              <p className="text-text-secondary text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

