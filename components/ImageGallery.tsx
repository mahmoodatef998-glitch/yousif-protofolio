'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PortfolioImage } from '@/types';
import { getResponsiveImageUrls } from '@/lib/cloudinary-url';
import { ImageModal } from './ImageModal';

interface ImageGalleryProps {
  images: PortfolioImage[];
  selectedCategory: string;
}

export function ImageGallery({ images, selectedCategory }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter images by category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'all') {
      return images;
    }
    return images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  const handleImageClick = (image: PortfolioImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNext = () => {
    const currentIndex = filteredImages.findIndex(
      (img) => img.public_id === selectedImage?.public_id
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = filteredImages.findIndex(
      (img) => img.public_id === selectedImage?.public_id
    );
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No images found in this category.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((image, index) => {
          const imageUrls = getResponsiveImageUrls(image.public_id);
          return (
            <ImageGalleryItem
              key={image.public_id}
              image={image}
              imageUrls={imageUrls}
              index={index}
              onClick={() => handleImageClick(image)}
            />
          );
        })}
      </div>

      <ImageModal
        image={selectedImage}
        images={filteredImages}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
}

interface ImageGalleryItemProps {
  image: PortfolioImage;
  imageUrls: ReturnType<typeof getResponsiveImageUrls>;
  index: number;
  onClick: () => void;
}

function ImageGalleryItem({ image, imageUrls, index, onClick }: ImageGalleryItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = itemRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={itemRef}
      className={`group relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 cursor-pointer transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <Image
        src={image.secure_url || imageUrls.medium}
        alt={image.alt || image.public_id}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-semibold text-lg px-4 text-center">
            {image.alt || 'View Image'}
          </p>
        </div>
      </div>
    </div>
  );
}

