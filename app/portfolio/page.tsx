import { Metadata } from 'next';
import { getAllImages } from '@/lib/cloudinary';
import { Category } from '@/types';
import PortfolioClient from '@/components/PortfolioClient';

export const metadata: Metadata = {
  title: 'Portfolio | Photography Gallery',
  description: 'Browse through our stunning photography portfolio. Explore wedding photos, portraits, events, and more.',
};

async function getPortfolioData() {
  try {
    const images = await getAllImages();
    
    // Extract unique categories from images
    const categoryMap = new Map<string, number>();
    images.forEach((img) => {
      const category = img.category || 'all';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Create category list
    const categories: Category[] = [
      { id: 'all', name: 'All', count: images.length },
      ...Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        count,
      })),
    ];

    return { images, categories };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return { images: [], categories: [{ id: 'all', name: 'All', count: 0 }] };
  }
}

export default async function PortfolioPage() {
  const { images, categories } = await getPortfolioData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Gallery
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our collection of professional photography work
          </p>
        </div>

        <PortfolioClient images={images} categories={categories} />
      </div>
    </div>
  );
}
