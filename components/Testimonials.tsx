'use client';

import { useEffect, useRef, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { useStaggeredReveal } from '@/lib/animations';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
  project?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Bride',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    text: 'Yousef captured our wedding day perfectly! Every moment was beautifully documented. The photos exceeded our expectations and we couldn\'t be happier.',
    rating: 5,
    project: 'Wedding Photography',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Business Owner',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: 'Professional, creative, and incredibly talented. The product photography for our brand elevated our marketing materials to a whole new level.',
    rating: 5,
    project: 'Product Photography',
  },
  {
    id: '3',
    name: 'Emma Williams',
    role: 'Restaurant Owner',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    text: 'The food photography was absolutely stunning! Our menu looks incredible and we\'ve seen a significant increase in reservations since the new photos.',
    rating: 5,
    project: 'Restaurant Photography',
  },
  {
    id: '4',
    name: 'David Martinez',
    role: 'Event Coordinator',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    text: 'Yousef is a true professional. His attention to detail and ability to capture the essence of every moment is remarkable. Highly recommended!',
    rating: 5,
    project: 'Event Photography',
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Staggered reveal animation
  const { ref: animationRef, visibleCount } = useStaggeredReveal(
    testimonials.length,
    150
  );

  // Combine refs
  const combinedRef = (node: HTMLElement | null) => {
    if (animationRef && 'current' in animationRef) {
      (animationRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
    if (sectionRef) {
      sectionRef.current = node;
    }
  };

  return (
    <section
      ref={combinedRef}
      id="testimonials"
      className="py-24 md:py-32 bg-dark-section relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">
            What Clients Say
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group card-premium card-glow relative bg-dark-bg/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-section/50 transition-all duration-500 ${
                index < visibleCount
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 0.15}s`,
              }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Quote className="w-8 h-8 text-accent" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-text-secondary mb-6 leading-relaxed text-sm">
                "{testimonial.text}"
              </p>

              {/* Project Badge */}
              {testimonial.project && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs rounded-full">
                    {testimonial.project}
                  </span>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30 group-hover:ring-accent transition-all"
                  />
                </div>
                <div>
                  <h4 className="text-text-primary font-semibold text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-text-secondary text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial (Carousel) */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-dark-bg/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-dark-section/50">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-accent/30"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-accent/50 mb-4" />
                <p className="text-text-primary text-lg md:text-xl leading-relaxed mb-6">
                  "{testimonials[currentIndex].text}"
                </p>
                <div>
                  <h4 className="text-text-primary font-bold text-lg mb-1">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-text-secondary">
                    {testimonials[currentIndex].role}
                    {testimonials[currentIndex].project && (
                      <span className="text-accent"> • {testimonials[currentIndex].project}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-accent w-8'
                    : 'bg-dark-section hover:bg-accent/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

