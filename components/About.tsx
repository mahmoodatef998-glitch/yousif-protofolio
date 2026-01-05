'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function About() {
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
      id="about"
      className={`py-24 md:py-32 bg-dark-bg transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[3/4]">
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
              alt="About"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-8">
              About
            </h2>
            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
              <p>
                I&apos;m Yousif, a professional photographer and videographer with over 10 years of
                experience in capturing authentic moments and creating timeless memories.
              </p>
              <p>
                My passion for photography began at an early age and has evolved into a career
                dedicated to excellence and creativity. I specialize in wedding photography,
                portrait sessions, event coverage, and commercial work.
              </p>
              <p>
                My work has been featured in various publications and exhibitions, and I&apos;ve
                had the privilege of working with clients from all walks of life, helping them
                preserve their most important moments.
              </p>
              <p>
                Whether it&apos;s a wedding, corporate event, or personal portrait session, I
                approach each project with attention to detail and a commitment to delivering
                stunning results that exceed expectations.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-dark-section">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">500+</div>
                <div className="text-sm text-text-secondary">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">10+</div>
                <div className="text-sm text-text-secondary">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">100%</div>
                <div className="text-sm text-text-secondary">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

