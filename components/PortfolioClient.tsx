'use client';

import { useState } from 'react';
import { ImageGallery } from './ImageGallery';
import { CategoryFilter } from './CategoryFilter';
import { Category, PortfolioImage } from '@/types';

interface PortfolioClientProps {
  images: PortfolioImage[];
  categories: Category[];
}

export default function PortfolioClient({ images, categories }: PortfolioClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  return (
    <>
      {categories.length > 1 && (
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}
      <ImageGallery images={images} selectedCategory={selectedCategory} />
    </>
  );
}

