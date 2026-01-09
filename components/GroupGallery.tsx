'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface GroupImage {
  id: string;
  title: string;
  image: string;
}

interface GroupGalleryProps {
  images: GroupImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function GroupGallery({ images, isOpen, onClose, initialIndex = 0 }: GroupGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-dark-bg/98 backdrop-blur-md flex items-center justify-center p-4 animate-modal-enter"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-dark-section/80 hover:bg-dark-section rounded-full text-text-primary hover:text-accent transition-all"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-dark-section/80 hover:bg-dark-section rounded-full text-text-primary hover:text-accent transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-dark-section/80 hover:bg-dark-section rounded-full text-text-primary hover:text-accent transition-all"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentImage.image}
            alt={currentImage.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark-section/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-text-primary">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-accent scale-110'
                    : 'border-dark-section hover:border-accent/50 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img.image}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

