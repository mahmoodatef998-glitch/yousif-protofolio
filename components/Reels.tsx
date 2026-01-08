'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStaggeredReveal } from '@/lib/animations';

interface Reel {
  id: string;
  title: string;
  thumbnail: string;
  video: string;
}

export function Reels() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedReel, setSelectedReel] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content?section=reels', {
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        console.error('Failed to fetch reels:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setLoading(false);
        setReels([]);
        return;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      console.log('Reels fetched:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedReels = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '') // Filter out empty URLs
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Reel',
            thumbnail: item.thumbnail_url || item.media_url || '',
            video: item.media_url || '',
          }));
        
        console.log('Reels formatted:', formattedReels);
        setReels(formattedReels);
      } else {
        console.log('No reels found in database or empty array');
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      setReels([]);
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
      fetchReels();
    }
    
    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' && 
            (event.data.section === 'reels' || !event.data.section)) {
          fetchReels();
        }
      };
    }
    
    // Refresh data every 5 minutes to show new uploads (reduced from 30s to prevent lag)
    interval = setInterval(() => {
      if (mounted) {
        fetchReels();
      }
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchReels]);

  // Staggered reveal animation for reels
  const { ref: animationRef, visibleCount } = useStaggeredReveal(
    reels.length,
    80 // 80ms delay between each reel (faster for reels)
  );

  // Combine refs
  const combinedRef = useCallback((node: HTMLElement | null) => {
    if (animationRef && 'current' in animationRef) {
      (animationRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
    if (sectionRef) {
      sectionRef.current = node;
    }
  }, [animationRef]);

  if (loading) {
    return (
      <section id="reels" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Reels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-skeleton aspect-[9/16] rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-dark-bg/50" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) {
    return (
      <section id="reels" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16">Reels</h2>
          <p className="text-text-secondary">No reels yet. Upload reels from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={combinedRef}
        id="reels"
        className="py-24 md:py-32 bg-dark-section"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Reels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                className={`group card-premium card-glow card-ripple relative aspect-[9/16] overflow-hidden cursor-pointer rounded-2xl ${
                  index < visibleCount 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-[60px]'
                }`}
                style={{
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${index * 0.1}s`,
                  filter: index < visibleCount ? 'blur(0)' : 'blur(4px)',
                }}
                onClick={() => setSelectedReel(reel.video)}
              >
                {/* Image with parallax and blur placeholder */}
                <div className="absolute inset-0">
                  {/* Blur placeholder */}
                  <img
                    src={reel.thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                    aria-hidden="true"
                  />
                  {/* Main image */}
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="card-image-parallax relative w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: 0 }}
                    loading="lazy"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                  />
                </div>
                
                {/* Enhanced gradient overlay */}
                <div className="card-overlay" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                  <div className="text-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                    <h3 className="card-title text-text-primary text-lg font-bold mb-3 text-glow">
                      {reel.title}
                    </h3>
                    <div className="card-subtitle w-12 h-0.5 bg-accent mx-auto mb-3" />
                  </div>
                </div>
                
                {/* Play button - enhanced */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-dark-bg/50 backdrop-blur-sm border-2 border-accent/30 rounded-full opacity-100 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 flex items-center justify-center z-10">
                  <svg className="w-6 h-6 text-accent group-hover:text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {/* Content Interaction (Like, Review, Views) */}
                <ContentInteraction
                  contentId={reel.id}
                  showReviewButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedReel && (
        <div
          className="fixed inset-0 z-50 bg-dark-bg/95 flex items-center justify-center p-4"
          onClick={() => setSelectedReel(null)}
        >
          <button
            onClick={() => setSelectedReel(null)}
            className="absolute top-6 right-6 text-text-primary hover:text-accent transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <video
              src={selectedReel}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}

