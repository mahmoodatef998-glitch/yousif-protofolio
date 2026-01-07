'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useStaggeredReveal } from '@/lib/animations';

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
      // Only show loading on initial fetch
      if (images.length === 0) {
        setLoading(true);
      }
      
      const response = await fetch('/api/content?section=wedding', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.error('Failed to fetch wedding images:', response.status, response.statusText);
        if (images.length === 0) {
          setLoading(false);
          setImages([]);
        }
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
        
        // Only update if data actually changed (compare IDs)
        const currentIds = images.map(img => img.id).sort().join(',');
        const newIds = formattedImages.map(img => img.id).sort().join(',');
        
        if (currentIds !== newIds) {
          setImages(formattedImages);
        }
      } else if (images.length === 0) {
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching wedding images:', error);
      if (images.length === 0) {
        setImages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [images.length]);

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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-text-secondary">Loading wedding gallery...</div>
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
                className={`group relative aspect-[4/3] overflow-hidden cursor-pointer hover-lift transition-opacity-smooth transition-transform-smooth ${
                  index < visibleCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: `${index * 0.1}s`,
                }}
                onClick={() => setSelectedImage(item.image)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    console.error('❌ Image failed to load:', {
                      src: item.image,
                      title: item.title,
                      id: item.id,
                    });
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', {
                      src: item.image,
                      title: item.title,
                    });
                  }}
                />
                <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/80 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <p className="text-text-primary text-xl font-semibold mb-2">{item.title}</p>
                    <p className="text-text-secondary text-sm">Wedding</p>
                  </div>
                </div>
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

