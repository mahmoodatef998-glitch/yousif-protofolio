/**
 * Client-side utility functions for building Cloudinary image URLs
 * These functions don't require the Cloudinary SDK and can be used in client components
 */

/**
 * Get optimized image URL from Cloudinary (client-side safe)
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    return publicId; // Return public_id as fallback
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
  } = options;

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  const params: string[] = [];

  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  if (quality !== undefined) params.push(`q_${quality}`);
  if (format) params.push(`f_${format}`);

  const transformString = params.length > 0 ? `${params.join(',')}/` : '';
  return `${baseUrl}/${transformString}${publicId}`;
}

/**
 * Get responsive image URLs for different screen sizes (client-side safe)
 */
export function getResponsiveImageUrls(publicId: string): {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    thumbnail: getCloudinaryImageUrl(publicId, { width: 300, quality: 80 }),
    small: getCloudinaryImageUrl(publicId, { width: 640, quality: 85 }),
    medium: getCloudinaryImageUrl(publicId, { width: 1024, quality: 90 }),
    large: getCloudinaryImageUrl(publicId, { width: 1920, quality: 95 }),
    original: getCloudinaryImageUrl(publicId, { quality: 'auto' }),
  };
}

