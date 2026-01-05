import { Hero } from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllImages } from '@/lib/cloudinary';
import { PortfolioImage } from '@/types';

// Get sections with their images from Cloudinary
async function getSectionsWithImages() {
  try {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      console.log('Cloudinary not configured, returning empty sections');
      return [];
    }

    const images = await getAllImages();
    
    // Group images by category (section)
    const sectionsMap = new Map<string, PortfolioImage[]>();
    
    images.forEach((img) => {
      const section = img.category || 'uncategorized';
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, []);
      }
      sectionsMap.get(section)!.push(img);
    });

    // Convert to array with images
    const sections = Array.from(sectionsMap.entries()).map(([name, items]) => ({
      name,
      count: items.length,
      images: items,
      coverImage: items[0]?.secure_url || items[0]?.public_id || '',
    }));

    return sections;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

export default async function Home() {
  const sections = await getSectionsWithImages();

  return (
    <>
      <Hero />

      {/* Sections with Images */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Work
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Browse through our portfolio sections
            </p>
          </div>

          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                No sections available yet
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Your First Section
              </Link>
            </div>
          ) : (
            <div className="space-y-24">
              {sections.map((section, sectionIndex) => (
                <div key={section.name} className="scroll-mt-20">
                  {/* Section Header */}
                  <div className="mb-8">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
                      {section.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {section.count} {section.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Section Images Grid */}
                  {section.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                      {section.images.map((image, imageIndex) => (
                        <Link
                          key={image.public_id}
                          href={`/portfolio?category=${encodeURIComponent(section.name)}`}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <Image
                            src={image.secure_url}
                            alt={image.alt || section.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            loading={sectionIndex === 0 && imageIndex < 8 ? 'eager' : 'lazy'}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
                              {image.alt && (
                                <p className="text-white font-semibold text-lg mb-1">
                                  {image.alt}
                                </p>
                              )}
                              {image.caption && (
                                <p className="text-gray-200 text-sm">
                                  {image.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">
                        No images in this section yet
                      </p>
                    </div>
                  )}

                  {/* View More Link */}
                  {section.images.length > 0 && (
                    <div className="text-center">
                      <Link
                        href={`/portfolio?category=${encodeURIComponent(section.name)}`}
                        className="inline-flex items-center px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        View All {section.name} Photos
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </div>
                  )}

                  {/* Divider between sections */}
                  {sectionIndex < sections.length - 1 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-16"></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {sections.length > 0 && (
            <div className="text-center mt-16">
              <Link
                href="/portfolio"
                className="inline-flex items-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Full Portfolio
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
