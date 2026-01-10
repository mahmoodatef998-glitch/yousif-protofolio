'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useScrollReveal } from '@/lib/animations';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ArrowDown, Calendar, Eye } from 'lucide-react';

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [aboutData, setAboutData] = useState({
    heroTitle: 'About',
    heroSubtitle: '',
    bio: '',
    profileImage: '', // Start empty, will be set from API
    heroVideoUrl: '', // Optional video background URL
    stats: { clients: 500, projects: 10, awards: 100 },
  });
  const [loading, setLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0); // Force image reload when URL changes

  const fetchAbout = useCallback(async () => {
    try {
      const response = await fetch('/api/about', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch about:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || errorData.details || 'Unknown error',
        });
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      const { data } = result;
      
      if (data) {
        setAboutData({
          heroTitle: data.hero_title || 'About',
          heroSubtitle: data.hero_subtitle || '',
          bio: data.bio_text || '',
          profileImage: data.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          heroVideoUrl: data.hero_video_url || '', // Optional video background
          stats: data.stats && typeof data.stats === 'object' ? data.stats : { clients: 500, projects: 10, awards: 100 },
        });
      }
    } catch (error: any) {
      console.error('Error fetching about:', {
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel: BroadcastChannel | null = null;
    let interval: NodeJS.Timeout | null = null;
    
    // Initial fetch
    if (mounted) {
      fetchAbout();
    }
    
    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' && 
            (event.data.section === 'about' || !event.data.section)) {
          fetchAbout();
        }
      };
    }
    
    // Refresh data every 30 seconds to show new updates
    interval = setInterval(() => {
      if (mounted) {
        fetchAbout();
      }
    }, 30000);
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchAbout]);

  // Animation hooks - separate for image and text
  const { ref: imageRef, isVisible: imageVisible } = useScrollReveal({
    threshold: 0.2,
    triggerOnce: true,
    delay: 0,
  });

  const { ref: textRef, isVisible: textVisible } = useScrollReveal({
    threshold: 0.2,
    triggerOnce: true,
    delay: 200,
  });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg"
    >
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {/* Video Background (optional - can be enabled from admin) */}
        {aboutData.heroVideoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={aboutData.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=90&auto=format&fit=crop"
            alt="About Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-dark-bg/80" />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-text-secondary/70 hover:text-accent transition-colors cursor-pointer group">
          <span className="text-sm font-medium">Scroll</span>
          <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* 
          Flexbox Container: 
          - flex-col on mobile (stack vertically)
          - flex-row on desktop (side by side)
          - items-center: vertically center items
          - gap-8 lg:gap-16: responsive spacing
        */}
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-16 min-h-[70vh] md:min-h-[80vh]">
          {/* 
            Image Container with Animation:
            - Safe animation: only opacity and transform (no layout shift)
            - Default visible if reduced-motion or JS fails
            - Fade + scale animation
          */}
          <div
            ref={imageRef as React.RefObject<HTMLDivElement>}
            className="relative w-full sm:w-[80%] md:w-[70%] lg:w-[40%] flex-shrink-0 max-w-full order-1 transition-opacity-smooth transition-transform-smooth"
            style={{
              opacity: imageVisible ? 1 : 0,
              transform: imageVisible ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            <div className="relative w-full aspect-[3/4] sm:aspect-[3/4] md:aspect-[3/4] overflow-hidden rounded-lg hover-scale bg-dark-section">
              {aboutData.profileImage ? (
                <img
                  key={imageKey}
                  src={`${aboutData.profileImage}${aboutData.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                  alt={aboutData.heroTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default image if current image fails to load
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('unsplash.com')) {
                      target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-section text-text-secondary">
                  {loading ? (
                    <div className="animate-pulse text-sm">Loading...</div>
                  ) : (
                    <div className="text-sm">No image</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 
            Text Content Container with Animation:
            - Safe animation: only opacity and transform (no layout shift)
            - Staggered delay for smooth reveal
            - Default visible if reduced-motion or JS fails
          */}
          <div
            ref={textRef as React.RefObject<HTMLDivElement>}
            className="w-full lg:w-[60%] flex-shrink self-center order-2 transition-opacity-smooth transition-transform-smooth"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            {aboutData.heroSubtitle && (
              <p className="text-lg sm:text-xl md:text-2xl text-accent mb-4 md:mb-8">{aboutData.heroSubtitle}</p>
            )}
            {aboutData.bio && (
              <div className="space-y-4 md:space-y-6 text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed mb-6 md:mb-8">
                {aboutData.bio.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 md:mb-12">
              <a
                href="#contact"
                className="group px-8 py-4 bg-accent text-dark-bg font-semibold rounded-lg hover:bg-accent/90 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 btn-magnetic"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('#contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <Calendar className="w-5 h-5" />
                <span>Book a Session</span>
              </a>
              <a
                href="#product"
                className="group px-8 py-4 bg-transparent border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 btn-magnetic"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('#product');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <Eye className="w-5 h-5" />
                <span>View Portfolio</span>
              </a>
            </div>
            
            {/* Stats with Animation */}
            <div className="mt-8 md:mt-12 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-6 md:pt-8 border-t border-dark-section">
              <div className="text-center">
                <AnimatedCounter
                  value={aboutData.stats.projects}
                  duration={2000}
                  suffix="+"
                  className="text-4xl md:text-5xl font-bold text-accent mb-2"
                />
                <div className="text-sm text-text-secondary">Projects</div>
              </div>
              <div className="text-center">
                <AnimatedCounter
                  value={aboutData.stats.clients}
                  duration={2000}
                  suffix="+"
                  className="text-4xl md:text-5xl font-bold text-accent mb-2"
                />
                <div className="text-sm text-text-secondary">Clients</div>
              </div>
              <div className="text-center">
                <AnimatedCounter
                  value={aboutData.stats.awards}
                  duration={2000}
                  suffix="+"
                  className="text-4xl md:text-5xl font-bold text-accent mb-2"
                />
                <div className="text-sm text-text-secondary">Awards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

