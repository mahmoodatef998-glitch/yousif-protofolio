'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStaggeredReveal } from '@/lib/animations';

interface Reel {
  id: string;
  title: string;
  thumbnail: string;
  video: string;
}

// Helper function to extract frame from video as cover image
const getVideoCover = (videoUrl: string): string => {
  // For Cloudinary videos, we can use transformation to get a frame at 1 second
  if (videoUrl.includes('cloudinary.com')) {
    try {
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        // Insert thumbnail transformation: so_0 = start offset 0, w_400 = width, h_600 = height (9:16 portrait), c_fill = crop fill
        // This creates a portrait thumbnail from the first frame of the video
        const transformations = ['so_0', 'w_400', 'h_600', 'c_fill', 'q_auto', 'f_jpg'];
        pathParts.splice(uploadIndex + 1, 0, ...transformations);
        return url.origin + pathParts.join('/');
      }
    } catch (e) {
      console.error('Error parsing Cloudinary URL:', e);
    }
  }
  // Fallback: return empty, will use thumbnail_url from database
  return '';
};

export function Reels() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedReel, setSelectedReel] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);
  const [fullscreenReel, setFullscreenReel] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const fetchReels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content?section=reels', {
        cache: 'no-store', // Ensure fresh data
      });

      if (!response.ok) {
        console.error('Failed to fetch reels:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setLoading(false);
        setReels([]);
        return;
      }

      const result = await response.json();
      const data = result.data || result;

      console.log('Reels fetched:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        const formattedReels = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '') // Filter out empty URLs
          .map((item: any) => {
            const videoUrl = item.media_url || '';
            // HIGHLIGHT: Prioritize the thumbnail from database (custom upload or picker)
            // If it's the same as the video URL, it's likely not a real thumbnail yet
            const hasCustomThumbnail = item.thumbnail_url && item.thumbnail_url !== videoUrl;
            const coverImage = hasCustomThumbnail ? item.thumbnail_url : (getVideoCover(videoUrl) || item.thumbnail_url || '');

            return {
              id: item.id,
              title: item.title || 'Untitled Reel',
              thumbnail: coverImage || videoUrl, // Use cover image or fallback to video
              video: videoUrl,
            };
          });

        console.log('Reels formatted:', formattedReels);
        setReels(formattedReels);
      } else {
        console.log('No reels found in database or empty array');
        setReels([]);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      setReels([]);
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
      fetchReels();
    }

    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' &&
          (event.data.section === 'reels' || !event.data.section)) {
          fetchReels();
        }
      };
    }

    // Handle fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).mozFullScreenElement && !(document as any).msFullscreenElement) {
        setFullscreenReel(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Refresh data every 5 minutes to show new uploads (reduced from 30s to prevent lag)
    interval = setInterval(() => {
      if (mounted) {
        fetchReels();
      }
    }, 300000); // 5 minutes instead of 30 seconds

    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [fetchReels]);

  // Staggered reveal animation for reels
  const { ref: animationRef, visibleCount } = useStaggeredReveal(
    reels.length,
    80 // 80ms delay between each reel (faster for reels)
  );

  // Combine refs
  const combinedRef = useCallback((node: HTMLElement | null) => {
    if (animationRef && 'current' in animationRef) {
      (animationRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
    if (sectionRef) {
      sectionRef.current = node;
    }
  }, [animationRef]);

  if (loading) {
    return (
      <section id="reels" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-12 md:mb-16 text-center">
            Reels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card-skeleton aspect-[9/16] rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-dark-bg/50" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reels.length === 0) {
    return (
      <section id="reels" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-dark-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-12 md:mb-16">Reels</h2>
          <p className="text-text-secondary">No reels yet. Upload reels from the admin dashboard.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        ref={combinedRef}
        id="reels"
        className="py-16 sm:py-20 md:py-24 lg:py-32 bg-dark-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-12 md:mb-16 text-center">
            Reels
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {reels.map((reel, index) => {
              const handleFullscreen = (e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent opening modal
                const container = containerRefs.current.get(reel.id);
                if (container) {
                  if (container.requestFullscreen) {
                    container.requestFullscreen();
                  } else if ((container as any).webkitRequestFullscreen) {
                    (container as any).webkitRequestFullscreen();
                  } else if ((container as any).mozRequestFullScreen) {
                    (container as any).mozRequestFullScreen();
                  } else if ((container as any).msRequestFullscreen) {
                    (container as any).msRequestFullscreen();
                  }
                  setFullscreenReel(reel.id);
                }
              };

              return (
                <div
                  key={reel.id}
                  ref={(el) => {
                    if (el) {
                      containerRefs.current.set(reel.id, el);
                    } else {
                      containerRefs.current.delete(reel.id);
                    }
                  }}
                  className={`group card-premium card-glow card-ripple relative aspect-[9/16] overflow-hidden cursor-pointer rounded-2xl ${index < visibleCount
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-[60px]'
                    }`}
                  style={{
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${index * 0.1}s`,
                    filter: index < visibleCount ? 'blur(0)' : 'blur(4px)',
                  }}
                  onClick={() => setSelectedReel(reel.video)}
                  onMouseEnter={() => {
                    setHoveredReel(reel.id);
                    const video = videoRefs.current.get(reel.id);
                    if (video) {
                      video.currentTime = 0; // Start from beginning
                      video.play().catch(console.error);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredReel(null);
                    const video = videoRefs.current.get(reel.id);
                    if (video) {
                      video.pause();
                      video.currentTime = 0; // Reset to beginning
                    }
                  }}
                >
                  {/* Cover Image - shown when not hovering */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${hoveredReel === reel.id ? 'opacity-0' : 'opacity-100'
                    }`}>
                    {/* Blur placeholder */}
                    <img
                      src={reel.thumbnail}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                      aria-hidden="true"
                    />
                    {/* Main cover image */}
                    <img
                      src={reel.thumbnail}
                      alt={reel.title}
                      className="card-image-parallax relative w-full h-full object-cover transition-opacity duration-500"
                      style={{ opacity: 0 }}
                      loading="lazy"
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '1';
                      }}
                    />
                  </div>

                  {/* Video - plays on hover */}
                  <video
                    ref={(el) => {
                      if (el) {
                        videoRefs.current.set(reel.id, el);
                      } else {
                        videoRefs.current.delete(reel.id);
                      }
                    }}
                    src={reel.video}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hoveredReel === reel.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    onLoadedData={(e) => {
                      // Extract frame at 1 second as cover if no thumbnail
                      const video = e.currentTarget;
                      if (!reel.thumbnail && video.readyState >= 2) {
                        video.currentTime = 1; // Seek to 1 second for cover
                      }
                    }}
                  />

                  {/* Fullscreen button - shows on hover */}
                  <button
                    onClick={handleFullscreen}
                    className={`absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2.5 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 z-10 ${hoveredReel === reel.id ? 'opacity-100' : ''
                      }`}
                    aria-label="Fullscreen"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>

                </div>
              );
            })}
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
          <div className="relative w-full max-w-md aspect-[9/16] bg-dark-section rounded-lg overflow-hidden">
            <video
              src={selectedReel}
              controls
              autoPlay
              className="w-full h-full object-cover"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Fullscreen Reel - Portrait Mode */}
      {fullscreenReel && (() => {
        const reel = reels.find(r => r.id === fullscreenReel);
        if (!reel) return null;

        const isFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );

        if (!isFullscreen) return null;

        return (
          <div className="fixed inset-0 z-[60] bg-dark-bg flex items-center justify-center">
            <button
              onClick={() => {
                if (document.exitFullscreen) {
                  document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                  (document as any).webkitExitFullscreen();
                } else if ((document as any).mozCancelFullScreen) {
                  (document as any).mozCancelFullScreen();
                } else if ((document as any).msExitFullscreen) {
                  (document as any).msExitFullscreen();
                }
                setFullscreenReel(null);
              }}
              className="absolute top-6 right-6 text-white hover:text-accent transition-colors z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="w-full max-w-md aspect-[9/16] bg-dark-section rounded-lg overflow-hidden shadow-2xl">
                <video
                  src={reel.video}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

