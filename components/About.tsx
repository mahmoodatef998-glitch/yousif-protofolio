'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [aboutData, setAboutData] = useState({
    heroTitle: 'About',
    heroSubtitle: '',
    bio: '',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    stats: { clients: 500, projects: 10, awards: 100 },
  });
  const [loading, setLoading] = useState(true);

  const fetchAbout = useCallback(async () => {
    try {
      const response = await fetch('/api/about', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.error('Failed to fetch about:', response.status);
        return;
      }
      
      const { data } = await response.json();
      
      if (data) {
        setAboutData({
          heroTitle: data.hero_title || 'About',
          heroSubtitle: data.hero_subtitle || '',
          bio: data.bio_text || '',
          profileImage: data.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          stats: data.stats || { clients: 500, projects: 10, awards: 100 },
        });
      }
    } catch (error) {
      console.error('Error fetching about:', error);
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


  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80"
          alt="About Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-bg/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative aspect-[3/4] order-2 lg:order-1">
            <img
              src={aboutData.profileImage}
              alt={aboutData.heroTitle}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Text Side */}
          <div className="order-1 lg:order-2">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-8">
              {aboutData.heroTitle}
            </h2>
            {aboutData.heroSubtitle && (
              <p className="text-xl md:text-2xl text-accent mb-8">{aboutData.heroSubtitle}</p>
            )}
            {aboutData.bio && (
              <div className="space-y-6 text-lg md:text-xl text-text-secondary leading-relaxed">
                {aboutData.bio.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
            
            <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-dark-section">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{aboutData.stats.projects}+</div>
                <div className="text-sm text-text-secondary">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{aboutData.stats.clients}+</div>
                <div className="text-sm text-text-secondary">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{aboutData.stats.awards}+</div>
                <div className="text-sm text-text-secondary">Awards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

