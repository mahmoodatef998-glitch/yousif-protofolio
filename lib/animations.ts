'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook for scroll-based reveal animations
 * Uses IntersectionObserver to detect when element enters viewport
 * 
 * Safety: 
 * - Default state is visible (opacity: 1) if reduced-motion is enabled
 * - No layout shift (only uses transform/opacity)
 * - Progressive enhancement (works without JS)
 */
export function useScrollReveal(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced-motion preference - always visible
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    // Fallback timeout - ensure content is visible after 1 second if observer fails
    const fallbackTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay animation if specified
          if (options?.delay) {
            setTimeout(() => {
              setIsVisible(true);
            }, options.delay);
          } else {
            setIsVisible(true);
          }
          
          clearTimeout(fallbackTimeout);
          
          if (options?.triggerOnce !== false) {
            observer.unobserve(element);
          }
        } else if (!options?.triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '0px',
      }
    );

    observer.observe(element);
    
    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce, options?.delay]);

  return { ref, isVisible };
}

/**
 * Hook for staggered reveal animations (for lists/grids)
 * Animates items one by one with delay
 * 
 * Safety:
 * - Items start visible if reduced-motion is enabled
 * - No layout shift
 */
export function useStaggeredReveal(count: number, delay: number = 100) {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Respect reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      setVisibleCount(count);
      return;
    }

    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      setIsVisible(true);
      setVisibleCount(count);
    }, 1000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(fallbackTimeout);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [count]);

  useEffect(() => {
    if (!isVisible) return;

    // Staggered animation
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= count) {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [isVisible, count, delay]);

  return { ref, visibleCount };
}

/**
 * Hook for page load fade-in animation
 * 
 * Safety:
 * - Content is visible by default
 * - Only adds animation if motion is allowed
 */
export function usePageLoad() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Respect reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setMounted(true);
      return;
    }

    // Small delay for smooth page load
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return mounted;
}
