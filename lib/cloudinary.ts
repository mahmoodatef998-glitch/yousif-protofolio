import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryImage, PortfolioImage } from '@/types';

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Fetch images from Cloudinary by tag
 */
export async function getImagesByTag(tag: string): Promise<CloudinaryImage[]> {
  try {
    const result = await cloudinary.search
      .expression(`tags:${tag}`)
      .max_results(500)
      .execute();

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      tags: resource.tags,
      context: resource.context,
    }));
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}

/**
 * Fetch all images from a specific folder
 */
export async function getImagesByFolder(folder: string): Promise<CloudinaryImage[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .max_results(500)
      .execute();

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      tags: resource.tags,
      context: resource.context,
    }));
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}

/**
 * Fetch all images (for portfolio gallery)
 */
export async function getAllImages(): Promise<PortfolioImage[]> {
  try {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured, returning empty array');
      return [];
    }

    // You can modify this to fetch from a specific folder or with specific tags
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio';
    
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .max_results(500)
      .execute();

    return result.resources.map((resource: any) => {
      // Extract category from tags (first tag) or folder structure
      const category = resource.tags?.[0] || 'all';
      const alt = resource.context?.custom?.alt || resource.public_id.split('/').pop() || 'Photography';
      const caption = resource.context?.custom?.caption || '';

      return {
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        tags: resource.tags,
        context: resource.context,
        category,
        alt,
        caption,
      };
    });
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}


