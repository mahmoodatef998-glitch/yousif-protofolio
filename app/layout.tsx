import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SmoothScroll } from '@/components/SmoothScroll';
import { CustomCursor } from '@/components/CustomCursor';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Photography Portfolio | Professional Photography Services',
  description: 'Professional photography portfolio showcasing stunning images and creative work. Specializing in portraits, weddings, events, and more.',
  keywords: ['photography', 'portfolio', 'wedding photography', 'portrait photography', 'professional photographer'],
  authors: [{ name: 'Photography Portfolio' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Photography Portfolio | Professional Photography Services',
    description: 'Professional photography portfolio showcasing stunning images and creative work.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photography Portfolio',
    description: 'Professional photography portfolio showcasing stunning images and creative work.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'YOUSEF RABEA',
    jobTitle: 'Professional Photographer & Videographer',
    description: 'Professional photographer and videographer capturing authentic moments and creating timeless memories.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    sameAs: [
      'https://instagram.com',
      'https://linkedin.com',
    ],
    knowsAbout: [
      'Wedding Photography',
      'Product Photography',
      'Restaurant Photography',
      'Event Photography',
      'Videography',
    ],
    offers: {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        serviceType: 'Photography Services',
        areaServed: 'Worldwide',
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/contact`,
        },
      },
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SmoothScroll>
            <CustomCursor />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}

