'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Videos', href: '#videos' },
  { name: 'Reels', href: '#reels' },
  { name: 'Wedding', href: '#wedding' },
  { name: 'Product', href: '#product' },
  { name: 'Restaurant', href: '#restaurant' },
  { name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-bg/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
          >
            Yousif
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                {item.name}
              </a>
            ))}
            <Link
              href="/admin/login"
              className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-primary"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-dark-bg border-t border-dark-section">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block text-text-secondary hover:text-accent transition-colors"
              >
                {item.name}
              </a>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-accent transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
