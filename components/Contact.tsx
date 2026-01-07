'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Mail, Instagram, Linkedin, User, MessageSquare, Send, Phone } from 'lucide-react';

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: 'yousif@photography.com',
    phone: '+1 (234) 567-890',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  });

  const fetchContact = useCallback(async () => {
    try {
      const response = await fetch('/api/contact');
      const { data } = await response.json();
      
      if (data) {
        setContactInfo({
          email: data.email || 'yousif@photography.com',
          phone: data.phone || '+1 (234) 567-890',
          instagram: data.instagram_url || 'https://instagram.com',
          linkedin: data.linkedin_url || 'https://linkedin.com',
        });
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let channel: BroadcastChannel | null = null;
    let interval: NodeJS.Timeout | null = null;
    
    // Initial fetch
    if (mounted) {
      fetchContact();
    }
    
    // Listen for content updates from admin dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (mounted && event.data.type === 'content-updated' && 
            (event.data.section === 'contact' || !event.data.section)) {
          fetchContact();
        }
      };
    }
    
    // Refresh data every 30 seconds to show new updates
    interval = setInterval(() => {
      if (mounted) {
        fetchContact();
      }
    }, 30000);
    
    return () => {
      mounted = false;
      if (channel) channel.close();
      if (interval) clearInterval(interval);
    };
  }, [fetchContact]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      alert('Message sent successfully!');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-24 md:py-32 bg-dark-bg"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Let's create something amazing together. Reach out and let's discuss your next project.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Contact Information</h3>
              <div className="space-y-6">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-dark-section flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Email</p>
                    <p className="text-text-primary group-hover:text-accent transition-colors">
                      {contactInfo.email}
                    </p>
                  </div>
                </a>

                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-dark-section flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Phone</p>
                    <p className="text-text-primary group-hover:text-accent transition-colors">
                      {contactInfo.phone}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-6">Follow Me</h3>
              <div className="flex space-x-4">
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-dark-section flex items-center justify-center hover:bg-accent/20 hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-accent" />
                </a>
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-dark-section flex items-center justify-center hover:bg-accent/20 hover:scale-110 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-accent" />
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="w-12 h-12 rounded-lg bg-dark-section flex items-center justify-center hover:bg-accent/20 hover:scale-110 transition-all duration-300"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 text-accent" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-dark-section border border-dark-section rounded-lg text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-dark-section border border-dark-section rounded-lg text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-6 text-text-secondary group-focus-within:text-accent transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows={6}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-dark-section border border-dark-section rounded-lg text-text-primary placeholder-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-accent text-dark-bg font-semibold rounded-lg hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

