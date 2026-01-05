import { About } from '@/components/About';
import { Videos } from '@/components/Videos';
import { Reels } from '@/components/Reels';
import { Wedding } from '@/components/Wedding';
import { Product } from '@/components/Product';
import { Contact } from '@/components/Contact';

export default function Home() {
  return (
    <main className="bg-dark-bg">
      {/* About Section - Hero at top */}
      <About />
      
      {/* Videos Section - 3 full-screen videos */}
      <Videos />
      
      {/* Reels Section - 5 reels */}
      <Reels />
      
      {/* Wedding Section */}
      <Wedding />
      
      {/* Product Section */}
      <Product />
      
      {/* Contact Section */}
      <Contact />
    </main>
  );
}
