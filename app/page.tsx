import { Hero } from '@/components/Hero';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllImages } from '@/lib/cloudinary';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-url';

// Get sections from Cloudinary
async function getSections() {
  try {
    const images = await getAllImages();
    
    // Group images by category (section)
    const sectionsMap = new Map<string, any[]>();
    
    images.forEach((img) => {
      const section = img.category || 'uncategorized';
      if (!sectionsMap.has(section)) {
        sectionsMap.set(section, []);
      }
      sectionsMap.get(section)!.push(img);
    });

    // Convert to array and get first image from each section as cover
    const sections = Array.from(sectionsMap.entries()).map(([name, items]) => ({
      name,
      count: items.length,
      coverImage: items[0]?.secure_url || items[0]?.public_id || '',
    }));

    return sections;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

export default async function Home() {
  const sections = await getSections();

  return (
    <>
      <Hero />

      {/* Sections Grid */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section) => {
                const imageUrl = section.coverImage
                  ? getCloudinaryImageUrl(section.coverImage.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, ''), {
                      width: 800,
                      height: 600,
                      quality: 85,
                      format: 'auto',
                    })
                  : null;

                return (
                  <Link
                    key={section.name}
                    href="/portfolio"
                    className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-[4/3] relative bg-gray-200 dark:bg-gray-800">
                      {imageUrl && section.coverImage ? (
                        <Image
                          src={section.coverImage}
                          alt={section.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-lg font-semibold capitalize">
                            {section.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2 capitalize">{section.name}</h3>
                        <p className="text-gray-200 mb-4">
                          {section.count} {section.count === 1 ? 'item' : 'items'}
                        </p>
                        <div className="inline-flex items-center text-white font-semibold">
                          View Gallery
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {sections.length > 0 && (
            <div className="text-center mt-12">
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
