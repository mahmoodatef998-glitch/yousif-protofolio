# Quick Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Cloudinary account (free at cloudinary.com)
3. Formspree account (free at formspree.io)

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NEXT_PUBLIC_FORMSPREE_ID=your_formspree_id
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

3. **Set up Cloudinary:**
   - Create a folder named `portfolio` in Cloudinary Media Library
   - Upload your images to this folder
   - Add tags to images for categories (e.g., "wedding", "portrait", "events")

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to http://localhost:3000

## Cloudinary Image Setup

1. Log in to your Cloudinary account
2. Go to Media Library
3. Create a folder named `portfolio` (or update the folder name in `.env.local`)
4. Upload your images to this folder
5. For each image:
   - Add tags (first tag becomes the category)
   - Optionally add custom metadata:
     - Alt text: Context > Custom > alt
     - Caption: Context > Custom > caption

## Formspree Setup

1. Sign up at formspree.io
2. Create a new form
3. Copy the form ID (looks like: `xyzw1234`)
4. Add it to `.env.local` as `NEXT_PUBLIC_FORMSPREE_ID`

## Build for Production

```bash
npm run build
npm start
```

## Deployment

The easiest deployment option is Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

For detailed instructions, see README.md

