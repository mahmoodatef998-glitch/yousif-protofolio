'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Instagram, Linkedin } from 'lucide-react';

export function Contact() {
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
      id="contact"
      className={`py-32 bg-dark-bg transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-12">
          Contact
        </h2>

        <div className="space-y-8 mb-16">
          <a
            href="mailto:contact@example.com"
            className="block text-2xl text-text-secondary hover:text-accent transition-colors"
          >
            contact@example.com
          </a>

          <div className="flex justify-center space-x-8">
            <a
              href="#"
              className="text-text-secondary hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="#"
              className="text-text-secondary hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:contact@example.com"
              className="text-text-secondary hover:text-accent transition-colors"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>

        <form className="space-y-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 bg-dark-section border border-dark-section text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none transition-colors"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-dark-section border border-dark-section text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none transition-colors"
          />
          <textarea
            placeholder="Message"
            rows={6}
            className="w-full px-4 py-3 bg-dark-section border border-dark-section text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none transition-colors resize-none"
          />
          <button
            type="submit"
            className="w-full px-8 py-4 bg-transparent border border-text-secondary text-text-primary hover:border-accent hover:text-accent transition-all duration-300"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

