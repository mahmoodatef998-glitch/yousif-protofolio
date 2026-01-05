import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Photography Portfolio | Professional Photography Services',
  description: 'Professional photography portfolio showcasing stunning images and creative work. Specializing in portraits, weddings, events, and more.',
  keywords: ['photography', 'portfolio', 'wedding photography', 'portrait photography', 'professional photographer'],
  authors: [{ name: 'Photography Portfolio' }],
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex flex-col min-h-screen bg-dark-bg">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

