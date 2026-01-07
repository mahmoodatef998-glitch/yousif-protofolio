# Photography Portfolio Website

A modern, professional, and fully responsive photography portfolio website built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Cloudinary.

## ✨ Features

- 🎨 **Modern Design** - Clean, minimalistic, and visually striking design
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Theme** - Beautiful dark theme with accent colors
- 🖼️ **Dynamic Image Gallery** - Portfolio gallery with Cloudinary integration
- 🎥 **Video Support** - Full-screen video sections with autoplay
- 📝 **Contact Form** - Integrated contact form with Supabase
- ⚡ **Performance Optimized** - Fast loading with Next.js Image optimization
- 🔍 **SEO Optimized** - Meta tags, sitemap, and robots.txt
- 🔐 **Admin Dashboard** - Secure content management with Supabase authentication
- 📊 **Dynamic Content** - Manage all sections and content from admin panel
- 📤 **File Upload** - Upload images/videos up to 50MB via Cloudinary Widget
- 🔄 **Real-time Updates** - Content updates appear immediately

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image/Video Management**: Cloudinary
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Theme Management**: next-themes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Cloudinary account (free tier available)
- Supabase account (free tier available)

### Installation

1. **Clone or navigate to the project directory**

```bash
cd "path/to/project"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_FOLDER=portfolio
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset  # Optional, for widget uploads
```

4. **Set up Supabase Database**

Run the SQL script `supabase/complete_setup.sql` in Supabase SQL Editor to:
- Create all necessary tables
- Set up RLS policies
- Insert default sections
- Create triggers and functions

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3008](http://localhost:3008) in your browser.

## 📁 Project Structure

```
portfolio-website/
├── app/                      # Next.js App Router
│   ├── (main)/              # Main layout group
│   │   ├── layout.tsx      # Main layout with Navbar & Footer
│   │   └── page.tsx        # Home page
│   ├── admin/               # Admin dashboard
│   │   ├── login/          # Admin login
│   │   └── page.tsx        # Admin dashboard
│   ├── api/                 # API routes
│   │   ├── content/        # Content management API
│   │   ├── about/          # About section API
│   │   ├── contact/        # Contact API
│   │   └── cloudinary/     # Cloudinary upload API
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── About.tsx           # About section
│   ├── Videos.tsx          # Videos section
│   ├── Reels.tsx           # Reels section
│   ├── Wedding.tsx         # Wedding gallery
│   ├── Product.tsx         # Product gallery
│   ├── Restaurant.tsx       # Restaurant gallery
│   ├── Contact.tsx         # Contact section
│   ├── AdminDashboard.tsx  # Admin panel
│   ├── Navbar.tsx          # Navigation
│   └── Footer.tsx          # Footer
├── lib/                     # Utilities
│   ├── supabase/           # Supabase clients
│   ├── cloudinary.ts       # Cloudinary utilities
│   └── logger.ts           # Logging utility
├── supabase/                # SQL scripts
│   ├── complete_setup.sql  # Complete database setup
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Seed data
└── types/                   # TypeScript types
```

## 🎯 Main Features

### Admin Dashboard
- Upload images/videos (up to 50MB)
- Manage content for all sections
- Edit About section
- Manage contact information
- Real-time content updates

### Sections
- **About**: Hero section with bio and stats
- **Videos**: Full-screen video sections
- **Reels**: Video reels gallery
- **Wedding**: Wedding photography gallery
- **Product**: Product photography gallery
- **Restaurant**: Restaurant photography gallery
- **Contact**: Contact form and information

## 📝 Documentation

- `PROJECT_REVIEW_REPORT.md` - Comprehensive project review and quality assessment
- `IMPROVEMENTS_RECOMMENDATIONS.md` - Recommended improvements
- `SETUP.md` - Detailed setup instructions
- `supabase/complete_setup.sql` - Complete database setup script

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

**Required Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_FOLDER`

## 🔒 Security

- Row Level Security (RLS) enabled in Supabase
- Environment variables protected
- Admin routes protected with authentication
- Debug endpoints disabled in production

## 📊 Performance

- Next.js Image optimization
- Lazy loading for images
- Efficient data fetching
- Optimized bundle size

## 🐛 Troubleshooting

See `PROJECT_REVIEW_REPORT.md` for common issues and solutions.

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using Next.js, TypeScript, Supabase, and Cloudinary
