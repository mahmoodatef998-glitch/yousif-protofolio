'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, galleryItem, fadeInDown } from '@/lib/animations';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
}

export function Wedding() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content?section=wedding', {
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        console.error('Failed to fetch wedding images:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setLoading(false);
        setImages([]);
        return;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      console.log('Wedding images fetched:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedImages = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '') // Filter out empty URLs
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Image',
            image: item.media_url || '',
          }));
        
        console.log('Wedding images formatted:', formattedImages);
        setImages(formattedImages);
      } else {
        console.log('No wedding images found in database or empty array');
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
        ref={sectionRef}
        id="wedding"
        className="py-24 md:py-32 bg-dark-bg"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.h2
            variants={fadeInDown}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center"
          >
            Wedding
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {images.map((item) => (
              <motion.div
                key={item.id}
                variants={galleryItem}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer rounded-lg"
                onClick={() => setSelectedImage(item.image)}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                </div>
                <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/80 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <p className="text-text-primary text-xl font-semibold mb-2">{item.title}</p>
                    <p className="text-text-secondary text-sm">Wedding</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-dark-bg/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-text-primary hover:text-accent transition-colors z-10"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-8 h-8" />
          </motion.button>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full h-full max-w-7xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Lightbox"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

