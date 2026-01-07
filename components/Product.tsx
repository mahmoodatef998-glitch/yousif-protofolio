'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
}

export function Product() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching product images...');
      
      const response = await fetch('/api/content?section=product', {
        cache: 'no-store', // Ensure fresh data
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch product images:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        setLoading(false);
        setImages([]);
        return;
      }
      
      const result = await response.json();
      console.log('📦 Raw API response:', result);
      
      const data = result.data || result;
      console.log('📊 Parsed data:', {
        isArray: Array.isArray(data),
        length: data?.length || 0,
        data: data,
      });
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedImages = data
          .filter((item: any) => {
            const hasUrl = item.media_url && item.media_url.trim() !== '';
            if (!hasUrl) {
              console.warn('⚠️ Item filtered out (no media_url):', item);
            }
            return hasUrl;
          })
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Image',
            image: item.media_url || '',
          }));
        
        console.log('✅ Product images formatted:', {
          count: formattedImages.length,
          images: formattedImages,
        });
        setImages(formattedImages);
      } else {
        console.warn('⚠️ No product images found:', {
          dataExists: !!data,
          isArray: Array.isArray(data),
          length: data?.length || 0,
          message: result.message || 'No data returned',
        });
        setImages([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching product images:', {
        error: error.message,
        stack: error.stack,
      });
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
            (event.data.section === 'product' || !event.data.section)) {
          console.log('Product section: Content updated, refreshing...');
          fetchImages();
        }
      };
    }
    
    // Refresh data every 30 seconds to show new uploads
    interval = setInterval(() => {
      if (mounted) {
        fetchImages();
      }
    }, 30000);
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchImages]);

  if (loading) {
    return (
      <section id="product" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-text-secondary">Loading product gallery...</div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="product" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16">Product</h2>
          <p className="text-text-secondary">No images yet. Upload images from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="product"
        className="py-24 md:py-32 bg-dark-section"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Product
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
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
                    <p className="text-text-secondary text-sm">Product</p>
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
