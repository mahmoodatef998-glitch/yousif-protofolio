'use client';

import { useEffect, useRef, useState } from 'react';

const videos = [
  {
    id: 1,
    title: 'Wedding Highlights',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
    description: 'Capturing the magic of your special day',
  },
  {
    id: 2,
    title: 'Portrait Session',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80',
    description: 'Professional portraits that tell your story',
  },
  {
    id: 3,
    title: 'Event Coverage',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1511574784320-5b5c2e5c5c5c?w=1920&q=80',
    description: 'Documenting your events with cinematic style',
  },
  {
    id: 4,
    title: 'Commercial Work',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80',
    description: 'High-quality commercial videography',
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
            <div className="absolute inset-0 bg-dark-bg/50" />
            <div className="relative z-10 text-center px-6">
              <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary mb-4">
                {video.title}
              </h3>
              <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

