'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
}

export function Restaurant() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/content?section=restaurant');
      const { data } = await response.json();
      
      if (data && data.length > 0) {
        const formattedImages = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled Image',
          image: item.media_url || '',
        }));
        setImages(formattedImages);
      }
    } catch (error) {
      console.error('Error fetching restaurant images:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <section id="restaurant" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-text-secondary">Loading restaurant gallery...</div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="restaurant"
        className={`py-24 md:py-32 bg-dark-section transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Restaurant
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
                />
                <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/80 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <p className="text-text-primary text-xl font-semibold mb-2">{item.title}</p>
                    <p className="text-text-secondary text-sm">Restaurant</p>
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

