# Photography Portfolio Website

A modern, professional, and fully responsive photography portfolio website built with Next.js 14, TypeScript, Tailwind CSS, and Cloudinary integration.

## Features

- 🎨 **Modern Design** - Clean, minimalistic, and visually striking design
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🖼️ **Dynamic Image Gallery** - Portfolio gallery with Cloudinary integration
- 🔍 **Category Filtering** - Filter images by category (Wedding, Portrait, Events, etc.)
- 🎭 **Image Lightbox** - Full-screen image viewer with navigation
- 📝 **Contact Form** - Integrated with Formspree (no backend required)
- ⚡ **Performance Optimized** - Fast loading with Next.js Image optimization
- 🔍 **SEO Optimized** - Meta tags, sitemap, and robots.txt
- ✨ **Smooth Animations** - Beautiful transitions and hover effects

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Management**: Cloudinary
- **Forms**: Formspree
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme Management**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Cloudinary account (free tier available)
- Formspree account (free tier available)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd "path/to/project"
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Formspree Configuration
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_id

# Optional: Site URL for SEO
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Cloudinary Setup

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Create a folder named `portfolio` in your Cloudinary media library
4. Upload your images to the `portfolio` folder
5. Add tags to images for categorization (e.g., "wedding", "portrait", "events")
6. Optionally add custom metadata (alt text, captions) in the image context

### Formspree Setup

1. Sign up for a free account at [formspree.io](https://formspree.io)
2. Create a new form and copy the form ID
3. Add the form ID to your `.env.local` file as `NEXT_PUBLIC_FORMSPREE_ID`

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

## Project Structure

```
portfolio-website/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Home page
│   ├── portfolio/           # Portfolio gallery page
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── globals.css          # Global styles
│   ├── sitemap.ts           # Sitemap generation
│   └── robots.ts            # Robots.txt
├── components/              # React components
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Footer
│   ├── Hero.tsx            # Hero section
│   ├── ImageGallery.tsx    # Image gallery grid
│   ├── ImageModal.tsx      # Lightbox modal
│   ├── CategoryFilter.tsx  # Category filter buttons
│   ├── ContactForm.tsx     # Contact form
│   ├── DarkModeToggle.tsx  # Theme toggle
│   └── PortfolioClient.tsx # Portfolio client wrapper
├── lib/                     # Utility functions
│   ├── cloudinary.ts       # Cloudinary API utilities
│   └── utils.ts            # General utilities
└── types/                   # TypeScript types
    └── index.ts            # Type definitions
```

## Customization

### Updating Content

- **Home Page**: Edit `app/page.tsx` and `components/Hero.tsx`
- **About Page**: Edit `app/about/page.tsx`
- **Contact Information**: Edit `app/contact/page.tsx`
- **Navigation Links**: Edit `components/Navbar.tsx`
- **Footer**: Edit `components/Footer.tsx`

### Styling

- **Colors**: Modify `tailwind.config.ts` and `app/globals.css`
- **Fonts**: Change the font import in `app/layout.tsx`
- **Animations**: Adjust animation settings in component files and `tailwind.config.ts`

### Cloudinary Folder Structure

By default, the portfolio fetches images from the `portfolio` folder in Cloudinary. You can change this by:

1. Setting `NEXT_PUBLIC_CLOUDINARY_FOLDER` in `.env.local`
2. Or modifying the `getAllImages()` function in `lib/cloudinary.ts`

### Image Categories

Images are categorized using Cloudinary tags. To add categories:

1. Upload images to Cloudinary
2. Add tags to images (e.g., "wedding", "portrait", "events")
3. The first tag will be used as the category
4. Categories will automatically appear in the filter

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import the project in [Netlify](https://netlify.com)
3. Add environment variables in the Netlify dashboard
4. Set build command: `npm run build`
5. Set publish directory: `.next`

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Railway
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Node.js

## Performance Tips

- Use Cloudinary's automatic format optimization (f_auto) for WebP support
- Images are lazy-loaded by default in the gallery
- Next.js Image component automatically optimizes images
- Consider using Cloudinary's responsive images for better performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

Built with ❤️ using Next.js and Tailwind CSS

