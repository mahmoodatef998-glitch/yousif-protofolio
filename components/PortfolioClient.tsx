'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ImageGallery } from './ImageGallery';
import { CategoryFilter } from './CategoryFilter';
import { Category, PortfolioImage } from '@/types';

interface PortfolioClientProps {
  images: PortfolioImage[];
  categories: Category[];
}

export default function PortfolioClient({ images, categories }: PortfolioClientProps) {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryFromUrl || 'all'
  );

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

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

