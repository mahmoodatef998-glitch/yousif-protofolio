'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useScrollReveal } from '@/lib/animations';

interface Video {
  id: string;
  title: string;
  src: string;
  thumbnail: string;
  description: string;
}

export function Videos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content?section=videos', {
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        console.error('Failed to fetch videos:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setLoading(false);
        setVideos([]);
        return;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      console.log('Videos fetched:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedVideos = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '') // Filter out empty URLs
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Video',
            src: item.media_url || '',
            thumbnail: item.thumbnail_url || item.media_url || '',
            description: item.description || '',
          }));
        
        console.log('Videos formatted:', formattedVideos);
        setVideos(formattedVideos);
      } else {
        console.log('No videos found in database or empty array');
        setVideos([]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
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
      fetchVideos();
    }
    
    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' && 
            (event.data.section === 'videos' || !event.data.section)) {
          fetchVideos();
        }
      };
    }
    
    // Refresh data every 5 minutes to show new uploads (reduced from 30s to prevent lag)
    interval = setInterval(() => {
      if (mounted) {
        fetchVideos();
      }
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchVideos]);


  if (loading) {
    return (
      <section id="videos" className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading videos...</div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section id="videos" className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">Videos</h2>
          <p className="text-text-secondary">No videos yet. Upload videos from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="videos"
      className="bg-dark-bg"
    >
      <div className="space-y-0">
        {videos.map((video, index) => {
          // Individual scroll reveal for each video section
          const VideoSection = ({ video, index }: { video: Video; index: number }) => {
            const { ref, isVisible } = useScrollReveal({
              threshold: 0.3,
              triggerOnce: true,
              delay: index * 100, // Staggered delay
            });

            return (
              <div
                ref={ref as React.RefObject<HTMLDivElement>}
                className="relative w-full h-screen flex items-center justify-center overflow-hidden transition-opacity-smooth transition-transform-smooth"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                }}
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
            );
          };

          return <VideoSection key={video.id} video={video} index={index} />;
        })}
      </div>
    </section>
  );
}

