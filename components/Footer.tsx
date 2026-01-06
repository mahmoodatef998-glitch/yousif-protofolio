'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Mail, ArrowUp } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-dark-section border-t border-dark-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-4">Yousif</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Professional photographer and videographer capturing authentic moments and creating timeless memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#videos"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Videos
                </a>
              </li>
              <li>
                <a
                  href="#reels"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Reels
                </a>
              </li>
              <li>
                <a
                  href="#wedding"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Wedding
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Product
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-text-secondary hover:text-accent transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">
              Connect
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:yousif@photography.com"
                className="flex items-center space-x-3 text-text-secondary hover:text-accent transition-colors group"
              >
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">yousif@photography.com</span>
              </a>
              <div className="flex space-x-4 pt-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-dark-bg rounded-full text-text-secondary hover:text-accent hover:border-accent transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-dark-bg rounded-full text-text-secondary hover:text-accent hover:border-accent transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-dark-bg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-secondary text-sm">
              © {currentYear} Yousif. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors group"
            >
              <span className="text-sm">Back to top</span>
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
