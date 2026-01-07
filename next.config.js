/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  // Suppress hydration warnings from browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ensure proper asset serving
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Increase body size limit for file uploads (Note: Vercel has a 4.5MB limit for serverless functions)
  // For larger files, use Cloudinary Upload Widget directly
  api: {
    bodyParser: {
      sizeLimit: '4.5mb', // Vercel's maximum limit
    },
    responseLimit: false,
  },
  // Disable Vercel Analytics in development if causing issues
  ...(process.env.NODE_ENV === 'production' && {
    // Production-only config
  }),
};

module.exports = nextConfig;

