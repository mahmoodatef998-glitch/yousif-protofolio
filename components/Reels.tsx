'use client';

import { useEffect, useRef, useState } from 'react';

interface Reel {
  id: string;
  title: string;
  thumbnail: string;
  video: string;
}

export function Reels() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/content?section=reels');
      const { data } = await response.json();
      
      if (data && data.length > 0) {
        const formattedReels = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled Reel',
          thumbnail: item.thumbnail_url || item.media_url || '',
          video: item.media_url || '',
        }));
        setReels(formattedReels);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
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
      <section id="reels" className="py-24 md:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-text-secondary">Loading reels...</div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) {
    return null;
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="reels"
        className={`py-24 md:py-32 bg-dark-section transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center">
            Reels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="group relative aspect-[9/16] overflow-hidden cursor-pointer"
                onClick={() => setSelectedReel(reel.video)}
              >
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-dark-bg/0 group-hover:bg-dark-bg/70 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <p className="text-text-primary text-lg font-semibold mb-2">{reel.title}</p>
                    <div className="w-12 h-0.5 bg-accent mx-auto" />
                  </div>
                </div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-dark-bg/50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
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

