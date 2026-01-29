'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ThumbnailSelectorProps {
    videoUrl: string;
    currentThumbnail?: string;
    onSelect: (thumbnailUrl: string) => void;
    onClose: () => void;
}

export function ThumbnailSelector({ videoUrl, currentThumbnail, onSelect, onClose }: ThumbnailSelectorProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Function to generate Cloudinary thumbnail URL from video URL and timestamp
    const generateCloudinaryThumbnail = (url: string, time: number) => {
        if (!url.includes('cloudinary.com')) return null;

        try {
            // Cloudinary video URL format: .../video/upload/v123/public_id.mp4
            // Thumbnail format: .../video/upload/so_5.0/v123/public_id.jpg

            // 1. Change extension to .jpg
            let thumbUrl = url.replace(/\.[^/.]+$/, '.jpg');

            // 2. Insert so_[time] transformation
            // We look for /upload/ and insert after it
            if (thumbUrl.includes('/upload/')) {
                const timeParam = `so_${time.toFixed(1)}`;
                thumbUrl = thumbUrl.replace('/upload/', `/upload/${timeParam}/`);
            }

            return thumbUrl;
        } catch (e) {
            logger.error('Error generating thumbnail URL:', e);
            return null;
        }
    };

    const handleCapture = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            const thumbUrl = generateCloudinaryThumbnail(videoUrl, time);
            if (thumbUrl) {
                setPreviewUrl(thumbUrl);
            } else {
                alert('Could not generate thumbnail. Is this a Cloudinary video?');
            }
        }
    };

    const handleConfirm = () => {
        if (previewUrl) {
            onSelect(previewUrl);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-dark-section rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <Camera className="w-5 h-5 text-accent" />
                        Pick Video Cover
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Video Player */}
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/5">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                className="w-full h-full"
                                onLoadedMetadata={() => setIsReady(true)}
                                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm text-text-secondary">
                                <span>Current Time: {currentTime.toFixed(2)}s</span>
                            </div>
                            <button
                                onClick={handleCapture}
                                disabled={!isReady}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-text-primary rounded-xl font-medium transition-all"
                            >
                                <Camera className="w-5 h-5" />
                                Capture This Frame
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col">
                        <div className="flex-1 flex flex-col">
                            <span className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">Preview Cover</span>
                            <div className="relative flex-1 aspect-video bg-black/40 rounded-lg overflow-hidden border border-dashed border-white/20 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <p className="text-text-secondary text-sm">Select a frame from the video to generate a preview</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 flex gap-4">
                            <button
                                onClick={handleConfirm}
                                disabled={!previewUrl}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-dark-bg rounded-xl font-bold transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <Check className="w-5 h-5" />
                                Save as Cover
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-dark-bg text-text-primary border border-white/10 rounded-xl font-medium hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-accent/5 flex items-start gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg">
                        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        <strong>Hint:</strong> Use the video player to find the perfect moment. Once you capture it, we'll use Cloudinary's dynamic transformation to serve that exact frame as your video's poster image.
                    </p>
                </div>
            </div>
        </div>
    );
}
