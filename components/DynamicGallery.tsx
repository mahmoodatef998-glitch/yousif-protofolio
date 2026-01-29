'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, Images } from 'lucide-react';
import { useStaggeredReveal } from '@/lib/animations';
import { ContentInteraction } from '@/components/ContentInteraction';
import { GroupGallery } from '@/components/GroupGallery';
import { logger } from '@/lib/logger';

interface GalleryImage {
    id: string;
    title: string;
    image: string;
    group_id?: string | null;
    order_index?: number;
    created_at?: string;
}

interface DynamicGalleryProps {
    section: string;
    title: string;
}

export function DynamicGallery({ section, title }: DynamicGalleryProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<GalleryImage[] | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/content?section=${section}`, {
                cache: 'no-store',
            });

            if (!response.ok) {
                logger.error(`Failed to fetch ${section} images:`, response.status, response.statusText);
                setLoading(false);
                setImages([]);
                return;
            }

            const result = await response.json();
            const data = result.data || result;

            if (data && Array.isArray(data) && data.length > 0) {
                const formattedImages = data
                    .filter((item: any) => item.media_url && item.media_url.trim() !== '')
                    .map((item: any) => ({
                        id: item.id,
                        title: item.title || 'Untitled Image',
                        image: item.media_url || '',
                        group_id: item.group_id || null,
                        order_index: item.order_index || 0,
                        created_at: item.created_at || '',
                    }))
                    .sort((a, b) => {
                        if (a.order_index !== b.order_index) {
                            return a.order_index - b.order_index;
                        }
                        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    });

                setImages(formattedImages);
            } else {
                setImages([]);
            }
        } catch (error) {
            logger.error(`Error fetching ${section} images:`, error);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, [section]);

    useEffect(() => {
        let mounted = true;
        let channel: BroadcastChannel | null = null;
        let interval: NodeJS.Timeout | null = null;

        if (mounted) {
            fetchImages();
        }

        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            channel = new BroadcastChannel('content-updated');
            channel.onmessage = (event) => {
                if (mounted && event.data.type === 'content-updated' &&
                    (event.data.section === section || !event.data.section)) {
                    logger.debug(`${section} section: Content updated, refreshing...`);
                    fetchImages();
                }
            };
        }

        interval = setInterval(() => {
            if (mounted) {
                fetchImages();
            }
        }, 300000);

        return () => {
            mounted = false;
            if (channel) channel.close();
            if (interval) clearInterval(interval);
        };
    }, [fetchImages, section]);

    const { ref: animationRef, visibleCount } = useStaggeredReveal(
        images.length,
        100
    );

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
            <section id={section} className="py-24 md:py-32 bg-dark-bg">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center capitalize">
                        {title}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="card-skeleton aspect-[9/16] rounded-2xl overflow-hidden">
                                <div className="w-full h-full bg-dark-section/50" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (images.length === 0) {
        return null; // Don't show empty dynamic sections on home page
    }

    return (
        <>
            <section
                ref={combinedRef}
                id={section}
                className="py-24 md:py-32 bg-dark-bg"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-16 text-center capitalize">
                        {title}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                        {(() => {
                            const groupedImages = new Map<string | null, GalleryImage[]>();
                            const displayedImages: { item: GalleryImage; index: number; groupImages: GalleryImage[] | null }[] = [];

                            images.forEach((item) => {
                                const groupKey = item.group_id ? String(item.group_id) : null;
                                if (!groupedImages.has(groupKey)) {
                                    groupedImages.set(groupKey, []);
                                }
                                groupedImages.get(groupKey)!.push(item);
                            });

                            let displayIndex = 0;
                            groupedImages.forEach((groupItems, groupId) => {
                                if (groupId && groupItems.length > 1) {
                                    const sortedGroupItems = [...groupItems].sort((a, b) => {
                                        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                                        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                                        return bTime - aTime;
                                    });

                                    displayedImages.push({
                                        item: sortedGroupItems[0],
                                        index: displayIndex++,
                                        groupImages: sortedGroupItems,
                                    });
                                } else {
                                    groupItems.forEach((item) => {
                                        displayedImages.push({
                                            item,
                                            index: displayIndex++,
                                            groupImages: null,
                                        });
                                    });
                                }
                            });

                            return displayedImages.map(({ item, index, groupImages }) => (
                                <div
                                    key={item.id}
                                    className={`group card-premium card-glow card-ripple relative aspect-[9/16] overflow-hidden cursor-pointer rounded-2xl ${index < visibleCount
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-[60px]'
                                        }`}
                                    style={{
                                        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                                        transitionDelay: `${index * 0.12}s`,
                                        filter: index < visibleCount ? 'blur(0)' : 'blur(4px)',
                                    }}
                                    onClick={() => {
                                        if (groupImages && groupImages.length > 1) {
                                            setSelectedGroup(groupImages);
                                        } else {
                                            setSelectedImage(item.image);
                                        }
                                    }}
                                >
                                    <div className="absolute inset-0">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                                            aria-hidden="true"
                                        />
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="card-image-parallax relative w-full h-full object-cover transition-opacity duration-500"
                                            style={{ opacity: 0 }}
                                            loading="lazy"
                                            onLoad={(e) => {
                                                (e.target as HTMLImageElement).style.opacity = '1';
                                            }}
                                        />
                                    </div>

                                    <div className="card-overlay" />

                                    {groupImages && groupImages.length > 1 && (
                                        <div className="absolute top-4 right-4 bg-accent/90 text-dark-bg px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold z-10">
                                            <Images className="w-3.5 h-3.5" />
                                            <span>{groupImages.length}</span>
                                        </div>
                                    )}

                                    <ContentInteraction
                                        contentId={item.id}
                                        showReviewButton={true}
                                    />
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </section>

            {selectedGroup && (
                <GroupGallery
                    images={selectedGroup}
                    isOpen={!!selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    initialIndex={0}
                />
            )}

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
                    <div className="relative w-full max-w-md aspect-[9/16] mx-auto bg-dark-section rounded-lg overflow-hidden">
                        <Image
                            src={selectedImage}
                            alt="Lightbox"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
