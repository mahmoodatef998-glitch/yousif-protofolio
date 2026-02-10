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
        next: { revalidate: 3600 }, // Cache for 1 hour
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
            thumbnail: (item.thumbnail_url || item.media_url || '').replace('/upload/', '/upload/q_auto,f_auto,w_800/'),
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
            const [isMuted, setIsMuted] = useState(true); // Start muted for auto-play
            const [showControls, setShowControls] = useState(false);

            const { ref, isVisible } = useScrollReveal({
              threshold: 0.3,
              triggerOnce: true,
              delay: index * 100, // Staggered delay
            });

            // Intersection Observer for play/pause
            useEffect(() => {
              const video = videoRef.current;
              if (!video) return;

              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting) {
                    video.play().catch(() => {
                      // Video play might fail if not interacted with, catch it gracefully
                      setIsPlaying(false);
                    });
                  } else {
                    video.pause();
                  }
                },
                { threshold: 0.5 } // Play when 50% visible
              );

              observer.observe(video);
              return () => observer.disconnect();
            }, []);

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

            const handleMuteToggle = () => {
              if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
                setIsMuted(videoRef.current.muted);
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
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster={video.thumbnail}
                    preload="metadata"
                    onPlay={() => {
                      setIsPlaying(true);
                      if (videoRef.current) {
                        setIsMuted(videoRef.current.muted);
                      }
                    }}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Caption/Title Overlay */}
                  {video.title && video.title !== 'Untitled Video' && (
                    <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/80 via-black/60 to-transparent">
                      <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold text-center drop-shadow-lg">
                        {video.title}
                      </h3>
                    </div>
                  )}

                  {/* Controls overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
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
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Mute/Unmute button */}
                      <button
                        onClick={handleMuteToggle}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-110"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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

