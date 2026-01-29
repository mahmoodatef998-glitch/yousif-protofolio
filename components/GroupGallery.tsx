'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { ContentInteraction } from './ContentInteraction';

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
      className={`fixed inset-0 z-50 flex flex-col bg-dark-bg/98 backdrop-blur-xl transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      onClick={onClose}
    >
      {/* Header / Close Button */}
      <div className="absolute top-6 right-6 z-[60]">
        <button
          onClick={onClose}
          className="p-3 text-text-primary hover:text-accent bg-dark-section/50 backdrop-blur-md rounded-full transition-all hover:scale-110 active:scale-95"
          aria-label="Close gallery"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 z-[60] p-4 text-text-primary hover:text-accent bg-dark-section/30 hover:bg-dark-section/60 backdrop-blur-md rounded-full transition-all group active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 z-[60] p-4 text-text-primary hover:text-accent bg-dark-section/30 hover:bg-dark-section/60 backdrop-blur-md rounded-full transition-all group active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-h-[70vh] md:max-h-[80vh] flex items-center justify-center">
          <Image
            src={currentImage.image}
            alt={currentImage.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />

          {/* Subtle Bottom Gradient for Buttons Visibility */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Interaction Buttons in Modal */}
          <ContentInteraction
            contentId={currentImage.id}
            showReviewButton={true}
          />
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark-section/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-text-primary">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="h-24 flex-shrink-0 flex items-center justify-center gap-2 max-w-full overflow-x-auto px-4 pb-6 mt-auto">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex
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
  );
}
