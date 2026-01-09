'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Mail, Camera, Video, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-dark-bg via-dark-section to-dark-bg border-t border-accent/20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-12 md:mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-dark-bg" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary">YOUSEF RABEA</h3>
            </div>
            <p className="text-text-secondary leading-relaxed max-w-md mb-4 md:mb-6 text-sm md:text-base">
              Professional photographer and videographer capturing authentic moments and creating timeless memories that tell your story.
            </p>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <Camera className="w-4 h-4 text-accent" />
                <span className="text-sm">Photography</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Video className="w-4 h-4 text-accent" />
                <span className="text-sm">Videography</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-text-primary mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent" />
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'About', href: '#about', icon: null },
                { name: 'Videos', href: '#videos', icon: Video },
                { name: 'Reels', href: '#reels', icon: null },
                { name: 'Wedding', href: '#wedding', icon: Heart },
                { name: 'Product', href: '#product', icon: Camera },
                { name: 'Restaurant', href: '#restaurant', icon: null },
                { name: 'Contact', href: '#contact', icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="group flex items-center gap-2 text-text-secondary hover:text-accent transition-all duration-300 text-sm"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      <span className="relative">
                        {item.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-base font-bold text-text-primary mb-6 relative inline-block">
              Connect
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent" />
            </h4>
            <div className="space-y-6">
              <a
                href="mailto:yousif@photography.com"
                className="group flex items-center gap-3 text-text-secondary hover:text-accent transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-dark-section flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    Email
                  </p>
                  <p className="text-xs text-text-secondary">yousif@photography.com</p>
                </div>
              </a>
              
              <div className="flex gap-3 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl bg-gradient-to-br from-dark-section to-dark-bg border border-dark-bg flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/50 hover:scale-110 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl bg-gradient-to-br from-dark-section to-dark-bg border border-dark-bg flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent/50 hover:scale-110 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-12 border-t border-dark-bg/50">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 md:gap-4">
            <p className="text-text-secondary text-sm">
              © {currentYear} <span className="text-accent font-semibold">YOUSEF RABEA</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-accent fill-accent" />
              <span>for capturing moments</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
