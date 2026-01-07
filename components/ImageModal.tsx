'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { PortfolioImage } from '@/types';
import { getResponsiveImageUrls } from '@/lib/cloudinary-url';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  image: PortfolioImage | null;
  images: PortfolioImage[];
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function ImageModal({
  image,
  images,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, onNext, onPrevious]);

  if (!image || !isOpen) return null;

  const imageUrls = getResponsiveImageUrls(image.public_id);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative max-w-7xl w-full max-h-full transition-all duration-300"
        >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={onPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative w-full h-[80vh] bg-gray-900 rounded-lg overflow-hidden">
                <Image
                  src={image.secure_url || imageUrls.large}
                  alt={image.alt || image.public_id}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
              </div>

              {/* Image Info */}
              {(image.caption || image.alt) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white text-xl font-semibold mb-1">
                    {image.alt}
                  </h3>
                  {image.caption && (
                    <p className="text-gray-300 text-sm">{image.caption}</p>
                  )}
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-sm">
                  {images.findIndex((img) => img.public_id === image.public_id) + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
    </>
  );
}

