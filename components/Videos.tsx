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
      <section id="videos" className="bg-dark-bg min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading videos...</div>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section id="videos" className="bg-dark-bg min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4">Videos</h2>
          <p className="text-text-secondary text-sm sm:text-base">No videos yet. Upload videos from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="videos"
      className="bg-dark-bg py-8 sm:py-12 md:py-16 lg:py-20"
    >
      <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 px-4 sm:px-6 lg:px-8">
        {videos.map((video, index) => {
          // Individual scroll reveal for each video section
          const VideoSection = ({ video, index }: { video: Video; index: number }) => {
            const videoRef = useRef<HTMLVideoElement>(null);
            const containerRef = useRef<HTMLDivElement>(null);
            const [isPlaying, setIsPlaying] = useState(true);
            const [showControls, setShowControls] = useState(false);
            
            const { ref, isVisible } = useScrollReveal({
              threshold: 0.3,
              triggerOnce: true,
              delay: index * 100, // Staggered delay
            });

            const handlePlayPause = () => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            };

            const handleFullscreen = () => {
              if (containerRef.current) {
                if (containerRef.current.requestFullscreen) {
                  containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any).webkitRequestFullscreen) {
                  (containerRef.current as any).webkitRequestFullscreen();
                } else if ((containerRef.current as any).mozRequestFullScreen) {
                  (containerRef.current as any).mozRequestFullScreen();
                } else if ((containerRef.current as any).msRequestFullscreen) {
                  (containerRef.current as any).msRequestFullscreen();
                }
              }
            };

            return (
              <div
                ref={ref as React.RefObject<HTMLDivElement>}
                className="relative w-full transition-opacity-smooth transition-transform-smooth"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                }}
              >
                {/* Video container with spacing and controls */}
                <div
                  ref={containerRef}
                  className="relative w-full aspect-video rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden bg-dark-section shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                >
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster={video.thumbnail}
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Controls overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {/* Control buttons */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      {/* Play/Pause button */}
                      <button
                        onClick={handlePlayPause}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>

                      {/* Fullscreen button */}
                      <button
                        onClick={handleFullscreen}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
                        aria-label="Fullscreen"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </button>
                    </div>
                  </div>
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

