'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Award, Users, Heart, Mail, Phone, MapPin, Clock, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { PortfolioImage } from '@/types';
import { ContactForm } from '@/components/ContactForm';

interface Section {
  name: string;
  count: number;
  images: PortfolioImage[];
  coverImage: string;
}

const services = [
  {
    name: 'Wedding Photography',
    icon: Heart,
    description: 'Capturing your special day with elegance and emotion',
  },
  {
    name: 'Portrait Photography',
    icon: Users,
    description: 'Professional portraits that showcase your personality',
  },
  {
    name: 'Event Photography',
    icon: Camera,
    description: 'Documenting your events with precision and style',
  },
  {
    name: 'Commercial Photography',
    icon: Award,
    description: 'High-quality images for your business and brand',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Bride',
    content: 'Absolutely stunning work! Every photo captured the emotion and beauty of our special day perfectly.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Corporate Client',
    content: 'Professional, creative, and delivered exactly what we needed. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'Portrait Client',
    content: 'The best photography experience I\'ve ever had. The photos exceeded all my expectations.',
    rating: 5,
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@example.com',
    href: 'mailto:contact@example.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'New York, NY',
    href: '#',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon - Sat: 9AM - 6PM',
    href: '#',
  },
];

export default function SinglePageHome() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    // Fetch sections from API
    const fetchSections = async () => {
      try {
        const response = await fetch('/api/cloudinary/images');
        const data = await response.json();
        const images = data.images || [];
        
        const sectionsMap = new Map<string, PortfolioImage[]>();
        
        images.forEach((img: PortfolioImage) => {
          const section = img.category || 'uncategorized';
          if (!sectionsMap.has(section)) {
            sectionsMap.set(section, []);
          }
          sectionsMap.get(section)!.push(img);
        });

        let sectionsData = Array.from(sectionsMap.entries()).map(([name, items]) => ({
          name,
          count: items.length,
          images: items.slice(0, 8),
          coverImage: items[0]?.secure_url || items[0]?.public_id || '',
        }));

        // If no sections from Cloudinary, use demo sections
        if (sectionsData.length === 0 || sectionsData.every(s => s.images.length === 0)) {
          const demoImages = {
            wedding: [
              '1519682337058-a94d519337bc',
              '1465495976277-4387d4b0b4c6',
              '1511285560929-80b456fea0bc',
              '1519741347686-c1e0aadf9381',
              '1522673607200-164d066402dc',
              '1519167758481-83f550bb49b3',
              '1519741497686-c1e0aadf9381',
              '1522673607200-164d066402dc',
            ],
            portrait: [
              '1494790108377-be9c29b29330',
              '1507003211169-0a1dd7228f2d',
              '1500648767791-00dcc994a43e',
              '1506794778202-cad84cf45fdd',
              '1502823403499-6ccfcf4fb453',
              '1507591064345-6c1d8b4b8c3a',
              '1519085360753-af7119b3e8b7',
              '1506794778202-cad84cf45fdd',
            ],
            events: [
              '1511574784320-5b5c2e5c5c5c',
              '1519167758481-83f550bb49b3',
              '1519741497686-c1e0aadf9381',
              '1522673607200-164d066402dc',
              '1519682337058-a94d519337bc',
              '1465495976277-4387d4b0b4c6',
              '1511285560929-80b456fea0bc',
              '1519741347686-c1e0aadf9381',
            ],
          };

          sectionsData = [
            {
              name: 'wedding',
              count: 12,
              images: demoImages.wedding.map((id, i) => ({
                public_id: `demo-wedding-${i}`,
                secure_url: `https://images.unsplash.com/photo-${id}?w=800&q=80`,
                width: 800,
                height: 600,
                format: 'jpg',
                category: 'wedding',
                alt: `Wedding Photography ${i + 1}`,
                caption: '',
                tags: ['wedding'],
                context: {},
              })),
              coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
            },
            {
              name: 'portrait',
              count: 15,
              images: demoImages.portrait.map((id, i) => ({
                public_id: `demo-portrait-${i}`,
                secure_url: `https://images.unsplash.com/photo-${id}?w=800&q=80`,
                width: 800,
                height: 600,
                format: 'jpg',
                category: 'portrait',
                alt: `Portrait Photography ${i + 1}`,
                caption: '',
                tags: ['portrait'],
                context: {},
              })),
              coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80',
            },
            {
              name: 'events',
              count: 20,
              images: demoImages.events.map((id, i) => ({
                public_id: `demo-events-${i}`,
                secure_url: `https://images.unsplash.com/photo-${id}?w=800&q=80`,
                width: 800,
                height: 600,
                format: 'jpg',
                category: 'events',
                alt: `Event Photography ${i + 1}`,
                caption: '',
                tags: ['events'],
                context: {},
              })),
              coverImage: 'https://images.unsplash.com/photo-1511574784320-5b5c2e5c5c5c?w=1920&q=80',
            },
          ];
        }

        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
        // Use demo sections on error
        const demoWedding = ['1519682337058-a94d519337bc', '1465495976277-4387d4b0b4c6', '1511285560929-80b456fea0bc', '1519741347686-c1e0aadf9381', '1522673607200-164d066402dc', '1519167758481-83f550bb49b3', '1519741497686-c1e0aadf9381', '1522673607200-164d066402dc'];
        const demoPortrait = ['1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1506794778202-cad84cf45fdd', '1502823403499-6ccfcf4fb453', '1507591064345-6c1d8b4b8c3a', '1519085360753-af7119b3e8b7', '1506794778202-cad84cf45fdd'];
        
        setSections([
          {
            name: 'wedding',
            count: 12,
            images: demoWedding.map((id, i) => ({
              public_id: `demo-wedding-${i}`,
              secure_url: `https://images.unsplash.com/photo-${id}?w=800&q=80`,
              width: 800,
              height: 600,
              format: 'jpg',
              category: 'wedding',
              alt: `Wedding Photography ${i + 1}`,
              caption: '',
              tags: ['wedding'],
              context: {},
            })),
            coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80',
          },
          {
            name: 'portrait',
            count: 15,
            images: demoPortrait.map((id, i) => ({
              public_id: `demo-portrait-${i}`,
              secure_url: `https://images.unsplash.com/photo-${id}?w=800&q=80`,
              width: 800,
              height: 600,
              format: 'jpg',
              category: 'portrait',
              alt: `Portrait Photography ${i + 1}`,
              caption: '',
              tags: ['portrait'],
              context: {},
            })),
            coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 animate-spin mx-auto text-accent mb-4" />
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-10" />
          {sections.length > 0 && sections[0]?.coverImage ? (
            <Image
              src={sections[0].coverImage}
              alt="Hero Background"
              fill
              className="object-cover opacity-30"
              priority
              quality={90}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
          )}
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-20" />
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>
        
        {/* Content */}
        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-2xl opacity-50 animate-pulse" />
                <div className="relative flex items-center justify-center w-24 h-24 bg-accent rounded-full shadow-2xl">
                  <Camera className="w-12 h-12 text-gray-900" />
                </div>
              </div>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold font-heading mb-6 leading-tight"
            >
              <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Capturing
              </span>
              <span className="block bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent mt-2">
                Life&apos;s Moments
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto font-light"
            >
              Professional Photography
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
            >
              Transforming moments into timeless memories through the art of photography
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <a
                href="#portfolio"
                className="group relative inline-flex items-center px-10 py-5 bg-accent text-gray-900 rounded-lg font-bold text-lg hover:bg-accent-dark transition-all duration-300 shadow-2xl hover:shadow-accent/50 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Explore Portfolio
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
              
              <a
                href="#contact"
                className="group inline-flex items-center px-10 py-5 bg-transparent text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:border-accent hover:bg-accent/10 transition-all duration-300 backdrop-blur-sm"
              >
                Get In Touch
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { number: '500+', label: 'Photoshoots' },
                { number: '10+', label: 'Years Experience' },
                { number: '100%', label: 'Satisfaction' },
                { number: '50+', label: 'Awards' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">Scroll</span>
            <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-3 bg-accent rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-4 text-white">
              About Me
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Passionate photographer dedicated to capturing life&apos;s most precious moments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl group-hover:bg-accent/30 transition-all duration-500" />
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-700 group-hover:border-accent transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                  alt="Photographer"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Bio Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <p className="text-xl text-white font-semibold">
                  Welcome to my world of photography
                </p>
                <p>
                  With over a decade of experience in the photography industry, I specialize in
                  capturing authentic moments and creating timeless memories. My passion for
                  photography began at an early age and has evolved into a career dedicated to
                  excellence and creativity.
                </p>
                <p>
                  Whether it&apos;s a wedding, corporate event, or personal portrait session, I
                  approach each project with attention to detail and a commitment to delivering
                  stunning results that exceed expectations.
                </p>
                <p>
                  My work has been featured in various publications and exhibitions, and I&apos;ve
                  had the privilege of working with clients from all walks of life, helping them
                  preserve their most important moments.
                </p>
              </div>

              {/* Specialties */}
              <div className="pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Specialties</p>
                <div className="flex flex-wrap gap-3">
                  {['Wedding Photography', 'Portrait Sessions', 'Event Coverage', 'Commercial Work'].map((specialty, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gray-900 text-accent rounded-full text-sm font-medium border border-accent/30 hover:border-accent transition-colors"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-4 text-white">
              Portfolio
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore my latest work and creative projects
            </p>
          </motion.div>

          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No portfolio sections available yet</p>
              <Link
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-accent text-gray-900 rounded-lg font-semibold hover:bg-accent-dark transition-colors"
              >
                Add Your First Section
              </Link>
            </div>
          ) : (
            <div className="space-y-24">
              {sections.map((section, sectionIndex) => (
                <div key={section.name} className="scroll-mt-20">
                  <div className="mb-8">
                    <h3 className="text-3xl md:text-4xl font-bold font-heading mb-2 text-white capitalize">
                      {section.name}
                    </h3>
                    <p className="text-gray-400">
                      {section.count} {section.count === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {section.images.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                    >
                      {section.images.map((image, imageIndex) => (
                        <motion.div
                          key={image.public_id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: imageIndex * 0.1 }}
                          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-800 cursor-pointer shadow-2xl hover:shadow-accent/20 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] border border-gray-800 hover:border-accent/50"
                        >
                          <Image
                            src={image.secure_url}
                            alt={image.alt || section.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-125"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            loading={sectionIndex === 0 && imageIndex < 8 ? 'eager' : 'lazy'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="text-center px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              {image.alt && (
                                <p className="text-white font-bold text-lg mb-2 drop-shadow-lg">
                                  {image.alt}
                                </p>
                              )}
                              <div className="w-12 h-0.5 bg-accent mx-auto" />
                            </div>
                          </div>
                          {/* Overlay Border Effect */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-xl transition-all duration-500" />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                      <p className="text-gray-400">No images in this section yet</p>
                    </div>
                  )}

                  {section.images.length > 0 && (
                    <div className="text-center">
                      <Link
                        href={`/portfolio?category=${encodeURIComponent(section.name)}`}
                        className="inline-flex items-center px-6 py-3 bg-accent text-gray-900 rounded-lg font-semibold hover:bg-accent-dark transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        View All {section.name} Photos
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </div>
                  )}

                  {sectionIndex < sections.length - 1 && (
                    <div className="border-t border-gray-800 mt-16"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F1C40F' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5H20zm-2 0v-2H0v-2h18v-2H0v-2h18v-2H0v-2h18V6.5H0v-2h20V2.5H0V0h20v20.5h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-4 text-white">
              Services
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional photography services tailored to your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative p-8 bg-gray-900 rounded-2xl hover:bg-gray-800/50 transition-all duration-500 shadow-2xl hover:shadow-accent/20 transform hover:-translate-y-4 border-2 border-gray-800 hover:border-accent overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <Icon className="w-10 h-10 text-gray-900" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-white mb-4 group-hover:text-accent transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex items-center text-accent font-semibold">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-4 text-white">
              Testimonials
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              What my clients say about working with me
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative p-8 bg-gray-800 rounded-2xl shadow-2xl hover:shadow-accent/20 transition-all duration-500 border-2 border-gray-800 hover:border-accent/50 transform hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-8 h-8 text-gray-900" />
                </div>

                {/* Rating Stars */}
                <div className="flex mb-6 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial Content */}
                <p className="text-gray-300 mb-8 italic text-lg leading-relaxed relative z-10">
                  &quot;{testimonial.content}&quot;
                </p>

                {/* Author Info */}
                <div className="pt-6 border-t border-gray-700">
                  <p className="font-bold text-white text-lg mb-1">{testimonial.name}</p>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">{testimonial.role}</p>
                </div>

                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold font-heading mb-4 text-white">
              Get In Touch
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have a project in mind? Let&apos;s discuss how we can bring your vision to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold font-heading text-white mb-6">
                Contact Information
              </h3>
              <p className="text-gray-400 mb-8">
                Feel free to reach out through any of the following channels. I typically respond
                within 24 hours during business days.
              </p>

              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={index}
                      href={info.href}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group flex items-start space-x-4 p-6 rounded-xl bg-gray-900 hover:bg-gray-800 border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-x-2"
                    >
                      <div className="flex-shrink-0 w-14 h-14 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <Icon className="w-7 h-7 text-gray-900" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">
                          {info.label}
                        </div>
                        <div className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                          {info.value}
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-bold font-heading text-white mb-6">
                Send a Message
              </h3>
              <p className="text-gray-400 mb-8">
                Fill out the form below and I&apos;ll get back to you as soon as possible.
              </p>
              <div className="bg-gray-900 p-8 rounded-2xl">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

