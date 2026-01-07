'use client';

import { About } from '@/components/About';
import { Videos } from '@/components/Videos';
import { Reels } from '@/components/Reels';
import { Wedding } from '@/components/Wedding';
import { Product } from '@/components/Product';
import { Restaurant } from '@/components/Restaurant';
import { Contact } from '@/components/Contact';
import { usePageLoad } from '@/lib/animations';

export default function Home() {
  const mounted = usePageLoad();

  return (
    <main
      className="transition-opacity-smooth"
      style={{
        opacity: mounted ? 1 : 0,
      }}
    >
      {/* About Section - Hero at top */}
      <About />
      
      {/* Videos Section - 4 full-screen videos */}
      <Videos />
      
      {/* Reels Section - 5 reels */}
      <Reels />
      
      {/* Wedding Section */}
      <Wedding />
      
      {/* Product Section */}
      <Product />
      
      {/* Restaurant Section */}
      <Restaurant />
      
      {/* Contact Section */}
      <Contact />
    </main>
  );
}
