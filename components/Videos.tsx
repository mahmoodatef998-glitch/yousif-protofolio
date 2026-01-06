'use client';

import { useEffect, useRef, useState } from 'react';

interface Video {
  id: string;
  title: string;
  src: string;
  thumbnail: string;
  description: string;
}

export function Videos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/content?section=videos');
      const { data } = await response.json();
      
      if (data && data.length > 0) {
        const formattedVideos = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled Video',
          src: item.media_url || '',
          thumbnail: item.thumbnail_url || '',
          description: item.description || '',
        }));
        setVideos(formattedVideos);
      } else {
        // Fallback to demo videos if no data
        setVideos([
          {
            id: '1',
            title: 'Wedding Highlights',
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
            description: 'Capturing the magic of your special day',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fallback to demo videos on error
      setVideos([
        {
          id: '1',
          title: 'Wedding Highlights',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
          description: 'Capturing the magic of your special day',
        },
      ]);
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
      <section id="videos" className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading videos...</div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

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

