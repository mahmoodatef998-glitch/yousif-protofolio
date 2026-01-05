'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

const weddingImages = [
  { id: 1, title: 'Wedding Ceremony', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80' },
  { id: 2, title: 'Bridal Portrait', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80' },
  { id: 3, title: 'Reception', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80' },
  { id: 4, title: 'First Dance', image: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf9381?w=1200&q=80' },
  { id: 5, title: 'Wedding Details', image: 'https://images.unsplash.com/photo-1522673607200-164d066402dc?w=1200&q=80' },
  { id: 6, title: 'Couple Session', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80' },
];

export function Wedding() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <>
      <section
        ref={sectionRef}
        id="wedding"
        className={`py-24 md:py-32 bg-dark-bg transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Wedding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddingImages.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(item.image)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

