'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import Link from 'next/link';

const STATIC_NAV_ITEMS = [
  { name: 'About', href: '#about' },
  { name: 'Videos', href: '#videos' },
  { name: 'Reels', href: '#reels' },
  { name: 'Wedding', href: '#wedding' },
  { name: 'Product', href: '#product' },
  { name: 'Restaurant', href: '#restaurant' },
  { name: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [navItems, setNavItems] = useState(STATIC_NAV_ITEMS);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const { data } = await response.json();
      if (data) {
        const dynamicNav = data
          .filter((s: any) => !STATIC_NAV_ITEMS.find(sf => sf.href === `#${s.name.toLowerCase()}`))
          .map((s: any) => ({
            name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
            href: `#${s.name.toLowerCase()}`
          }));

        // Insert dynamic items before 'Contact'
        const contactIndex = STATIC_NAV_ITEMS.findIndex(item => item.name === 'Contact');
        const updatedNav = [...STATIC_NAV_ITEMS];
        updatedNav.splice(contactIndex, 0, ...dynamicNav);
        setNavItems(updatedNav);
      }
    } catch (error) {
      console.error('Error fetching nav items:', error);
    }
  };

  useEffect(() => {
    fetchSections();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sections-updated');
      channel.onmessage = (event) => {
        if (event.data.type === 'sections-updated') {
          fetchSections();
        }
      };
      return () => channel.close();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -50% 0px',
      }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-bg/95 backdrop-blur-md' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-lg font-semibold text-text-primary hover:text-accent transition-colors"
          >
            YOUSEF RABEA
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-sm transition-colors relative ${isActive
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-accent'
                    }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent animate-fade-in" />
                  )}
                </a>
              );
            })}
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
            {navItems.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`block transition-colors ${isActive
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-accent'
                    }`}
                >
                  {item.name}
                </a>
              );
            })}
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
