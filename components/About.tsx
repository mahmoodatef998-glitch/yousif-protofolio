'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { ArrowDown, Calendar, Eye } from 'lucide-react';
import { logger } from '@/lib/logger';

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [aboutData, setAboutData] = useState({
    heroTitle: 'About',
    heroSubtitle: '',
    bio: '',
    profileImage: '',
    heroVideoUrl: '',
    stats: { clients: 500, projects: 10, awards: 100 },
  });
  const [loading, setLoading] = useState(true);

  const fetchAbout = useCallback(async () => {
    try {
      const response = await fetch(`/api/about?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        logger.error('Failed to fetch about data');
        setLoading(false);
        return;
      }

      const result = await response.json();
      const { data } = result;
      if (data) {
        const title = data.hero_title !== undefined && data.hero_title !== null ? data.hero_title : 'Yousif';

        logger.debug('✅ About data mapped:', {
          heroTitle: title,
          heroSubtitle: data.hero_subtitle || '',
          bio: data.bio_text || ''
        });

        setAboutData({
          heroTitle: title,
          heroSubtitle: data.hero_subtitle || '',
          bio: data.bio_text || '',
          profileImage: data.profile_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          heroVideoUrl: data.hero_video_url || '',
          stats: data.stats && typeof data.stats === 'object' ? data.stats : { clients: 500, projects: 10, awards: 100 },
        });
      } else {
        logger.warn('⚠️ No about data found in database, using defaults');
        setAboutData(prev => ({ ...prev, heroTitle: 'Yousif' }));
      }
    } catch (error: any) {
      logger.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbout();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (event.data.type === 'content-updated' && (event.data.section === 'about' || !event.data.section)) {
          fetchAbout();
        }
      };
      return () => channel.close();
    }
  }, [fetchAbout]);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const imageVariants: any = {
    hidden: { opacity: 0, scale: 0.9, x: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg"
    >
      {/* Background with Parallax effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        {aboutData.heroVideoUrl ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={aboutData.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=90&auto=format&fit=crop"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-dark-bg/85 backdrop-blur-[2px]" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Profile Image Column */}
          <motion.div
            className="relative w-full lg:w-5/12 max-w-md lg:max-w-none"
            variants={imageVariants}
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl">
              {aboutData.profileImage && (
                <Image
                  src={aboutData.profileImage}
                  alt="Profile"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              )}
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 blur-3xl rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -z-10" />
          </motion.div>

          {/* Bio Content Column */}
          <div className="w-full lg:w-7/12 text-left">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-text-primary mb-6 tracking-tight"
            >
              {aboutData.heroTitle}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-accent font-medium mb-8"
            >
              {aboutData.heroSubtitle}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="space-y-6 text-lg md:text-xl text-text-secondary leading-relaxed mb-10"
            >
              {aboutData.bio.split('\n').filter(p => p.trim()).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5"
            >
              <div className="text-left">
                <AnimatedCounter
                  value={aboutData.stats.projects}
                  duration={2500}
                  suffix="+"
                  className="text-3xl md:text-4xl font-bold text-text-primary mb-1"
                />
                <p className="text-xs md:text-sm uppercase tracking-widest text-text-secondary font-semibold">Projects</p>
              </div>
              <div className="text-left">
                <AnimatedCounter
                  value={aboutData.stats.clients}
                  duration={2500}
                  suffix="+"
                  className="text-3xl md:text-4xl font-bold text-text-primary mb-1"
                />
                <p className="text-xs md:text-sm uppercase tracking-widest text-text-secondary font-semibold">Happy Clients</p>
              </div>
              <div className="text-left">
                <AnimatedCounter
                  value={aboutData.stats.awards}
                  duration={2500}
                  suffix="+"
                  className="text-3xl md:text-4xl font-bold text-text-primary mb-1"
                />
                <p className="text-xs md:text-sm uppercase tracking-widest text-text-secondary font-semibold">Awards</p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap gap-4"
            >
              <a
                href="#contact"
                className="px-8 py-4 bg-accent text-dark-bg font-bold rounded-xl hover:bg-accent/90 transition-all flex items-center gap-3 shadow-lg shadow-accent/20"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Calendar className="w-5 h-5" />
                Book Session
              </a>
              <a
                href="#wedding"
                className="px-8 py-4 bg-white/5 border border-white/10 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#portfolio-filter')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Eye className="w-5 h-5" />
                View Gallery
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Down Arrow */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <ArrowDown className="w-6 h-6 text-accent/50" />
      </motion.div>
    </section>
  );
}


