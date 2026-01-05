'use client';

import { useEffect, useRef, useState } from 'react';

const videos = [
  {
    id: 1,
    title: 'Wedding Highlights',
    src: 'https://videos.pexels.com/video-files/3044128/3044128-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
  },
  {
    id: 2,
    title: 'Portrait Session',
    src: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80',
  },
  {
    id: 3,
    title: 'Event Coverage',
    src: 'https://videos.pexels.com/video-files/3045164/3045164-hd_1920_1080_30fps.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511574784320-5b5c2e5c5c5c?w=1920&q=80',
  },
];

export function Videos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
    <section
      ref={sectionRef}
      id="videos"
      className={`bg-dark-bg transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="space-y-0">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={video.thumbnail}
            >
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-dark-bg/40" />
            <div className="relative z-10 text-center">
              <h3 className="text-4xl md:text-6xl font-bold text-text-primary mb-4">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

