'use client';

import { useEffect, useRef, useState } from 'react';

const services = [
  'Wedding Photography',
  'Portrait Sessions',
  'Event Coverage',
  'Commercial Photography',
  'Videography',
  'Post-Production',
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
      className={`py-32 bg-dark-section transition-opacity duration-1000 ${
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
                {service}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

