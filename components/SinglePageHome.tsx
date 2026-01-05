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

        const sectionsData = Array.from(sectionsMap.entries()).map(([name, items]) => ({
          name,
          count: items.length,
          images: items.slice(0, 8),
          coverImage: items[0]?.secure_url || items[0]?.public_id || '',
        }));

        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
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
        {/* Background Image/Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          {sections.length > 0 && sections[0]?.coverImage && (
            <Image
              src={sections[0].coverImage}
              alt="Hero Background"
              fill
              className="object-cover opacity-20"
              priority
            />
          )}
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-accent rounded-full shadow-lg mb-6">
                <Camera className="w-10 h-10 text-gray-900" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Capturing Life&apos;s
              <br />
              Beautiful Moments
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Professional photography that tells your story through stunning visuals and timeless memories.
            </p>
            
            <a
              href="#portfolio"
              className="inline-flex items-center px-8 py-4 bg-accent text-gray-900 rounded-lg font-semibold text-lg hover:bg-accent-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              See My Work
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center">
            <div className="w-1 h-3 bg-accent rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <div className="relative">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-700 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                  <Camera className="w-32 h-32 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Bio Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-white">
                About Me
              </h2>
              <div className="space-y-4 text-lg text-gray-300">
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
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-1">500+</div>
                  <div className="text-sm text-gray-400">Photoshoots</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-1">10+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-1">100%</div>
                  <div className="text-sm text-gray-400">Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-accent mb-1">50+</div>
                  <div className="text-sm text-gray-400">Awards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
              Portfolio
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore my latest work and creative projects
            </p>
          </div>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                      {section.images.map((image, imageIndex) => (
                        <Link
                          key={image.public_id}
                          href={`/portfolio?category=${encodeURIComponent(section.name)}`}
                          className="group relative aspect-square overflow-hidden rounded-lg bg-gray-800 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                        >
                          <Image
                            src={image.secure_url}
                            alt={image.alt || section.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            loading={sectionIndex === 0 && imageIndex < 8 ? 'eager' : 'lazy'}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
                              {image.alt && (
                                <p className="text-white font-semibold text-lg mb-1">
                                  {image.alt}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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
      <section id="services" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
              Services
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Professional photography services tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group p-8 bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 border border-gray-800 hover:border-accent"
                >
                  <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-400">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
              Testimonials
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              What my clients say about working with me
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800 hover:border-accent/50"
              >
                <Quote className="w-12 h-12 text-accent mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have a project in mind? Let&apos;s discuss how we can bring your vision to life
            </p>
          </div>

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

              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.href}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-900 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-gray-900" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400 mb-1">
                          {info.label}
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {info.value}
                        </div>
                      </div>
                    </a>
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

