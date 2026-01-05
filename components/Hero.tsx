'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-dark-bg/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-text-primary mb-6 tracking-tight">
            Photographer
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Capturing moments that tell your story
          </p>
          <a
            href="#work"
            className="inline-block px-8 py-4 text-text-primary border border-text-secondary hover:border-accent hover:text-accent transition-all duration-300"
          >
            View Work
          </a>
        </motion.div>
      </div>
    </section>
  );
}
