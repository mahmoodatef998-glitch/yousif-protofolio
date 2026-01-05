import { Hero } from '@/components/Hero';
import { Portfolio } from '@/components/Portfolio';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { Contact } from '@/components/Contact';

export default function Home() {
  return (
    <main className="bg-dark-bg">
      <Hero />
      <Portfolio />
      <About />
      <Services />
      <Contact />
    </main>
  );
}
