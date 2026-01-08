'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useStaggeredReveal } from '@/lib/animations';
import { ContentInteraction } from '@/components/ContentInteraction';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
}

export function Wedding() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/content?section=wedding', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.error('Failed to fetch wedding images:', response.status, response.statusText);
        setLoading(false);
        setImages([]);
        return;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedImages = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '')
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Image',
            image: item.media_url || '',
          }));
        
        setImages(formattedImages);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching wedding images:', error);
      setImages([]);
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
      fetchImages();
    }
    
    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' && 
            (event.data.section === 'wedding' || !event.data.section)) {
          console.log('Wedding section: Content updated, refreshing...');
          fetchImages();
        }
      };
    }
    
    // Refresh data every 5 minutes to show new uploads (reduced from 30s to prevent lag)
    interval = setInterval(() => {
      if (mounted) {
        fetchImages();
      }
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchImages]);

  // Staggered reveal animation for cards
  const { ref: animationRef, visibleCount } = useStaggeredReveal(
    images.length,
    100 // 100ms delay between each card
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
      <section id="wedding" className="py-24 md:py-32 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Wedding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-skeleton aspect-[4/3] rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-dark-section/50" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="wedding" className="py-24 md:py-32 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16">Wedding</h2>
          <p className="text-text-secondary">No images yet. Upload images from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={combinedRef}
        id="wedding"
        className="py-24 md:py-32 bg-dark-bg"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Wedding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item, index) => (
              <div
                key={item.id}
                className={`group card-premium card-glow card-ripple relative aspect-[4/3] overflow-hidden cursor-pointer rounded-2xl ${
                  index < visibleCount 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-[60px]'
                }`}
                style={{
                  transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${index * 0.12}s`,
                  filter: index < visibleCount ? 'blur(0)' : 'blur(4px)',
                }}
                onClick={() => setSelectedImage(item.image)}
              >
                {/* Image with parallax and blur placeholder */}
                <div className="absolute inset-0">
                  {/* Blur placeholder */}
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                    aria-hidden="true"
                  />
                  {/* Main image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="card-image-parallax relative w-full h-full object-cover transition-opacity duration-500"
                    style={{ opacity: 0 }}
                    loading="lazy"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', {
                        src: item.image,
                        title: item.title,
                        id: item.id,
                      });
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                      console.log('✅ Image loaded successfully:', {
                        src: item.image,
                        title: item.title,
                      });
                    }}
                  />
                </div>
                
                {/* Enhanced gradient overlay */}
                <div className="card-overlay" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                  <div className="text-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                    <h3 className="card-title text-text-primary text-2xl font-bold mb-3 text-glow">
                      {item.title}
                    </h3>
                    <div className="card-subtitle w-16 h-0.5 bg-accent mx-auto mb-3" />
                    <p className="card-subtitle text-text-secondary text-sm font-medium uppercase tracking-wider">
                      Wedding Photography
                    </p>
                  </div>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-2 border-accent/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>

                {/* Content Interaction (Like, Review, Views) */}
                <ContentInteraction
                  contentId={item.id}
                  showReviewButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-dark-bg/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-text-primary hover:text-accent transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Lightbox"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}

