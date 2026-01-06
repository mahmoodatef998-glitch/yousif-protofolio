'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Video, 
  Film, 
  Heart, 
  ShoppingBag, 
  UtensilsCrossed, 
  Mail, 
  Image as ImageIcon,
  Settings,
  Eye,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SectionType = 'about' | 'videos' | 'reels' | 'wedding' | 'product' | 'restaurant' | 'contact';

interface Section {
  id: SectionType;
  name: string;
  icon: any;
  description: string;
}

const sections: Section[] = [
  { id: 'about', name: 'About Me', icon: User, description: 'Manage your bio and personal information' },
  { id: 'videos', name: 'Videos', icon: Video, description: 'Manage full-screen videos' },
  { id: 'reels', name: 'Reels', icon: Film, description: 'Manage short video reels' },
  { id: 'wedding', name: 'Wedding', icon: Heart, description: 'Manage wedding gallery' },
  { id: 'product', name: 'Product', icon: ShoppingBag, description: 'Manage product photography' },
  { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed, description: 'Manage restaurant photography' },
  { id: 'contact', name: 'Contact', icon: Mail, description: 'Manage contact information' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState<SectionType>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const currentSection = sections.find(s => s.id === activeSection);
  const Icon = currentSection?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dark-section border-r border-dark-section transition-all duration-300 flex flex-col`}>
        {/* Logo/Header */}
        <div className="p-6 border-b border-dark-section">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-text-primary">Admin Panel</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-accent text-dark-bg'
                    : 'text-text-secondary hover:bg-dark-bg hover:text-text-primary'
                }`}
                title={!sidebarOpen ? section.name : undefined}
              >
                <SectionIcon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{section.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dark-section space-y-2">
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-dark-bg hover:text-text-primary transition-all"
            title={!sidebarOpen ? 'View Site' : undefined}
          >
            <Eye className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>View Site</span>}
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-dark-section border-b border-dark-section px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold text-text-primary">
                  {currentSection?.name}
                </h2>
              </div>
              <p className="text-text-secondary text-sm">
                {currentSection?.description}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isEditing
                  ? 'bg-accent text-dark-bg hover:bg-accent/90'
                  : 'bg-dark-bg text-text-primary hover:bg-dark-section border border-dark-section'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <SectionContent 
            section={activeSection} 
            isEditing={isEditing}
            onEditChange={setIsEditing}
          />
        </div>
      </main>
    </div>
  );
}

// Section Content Component
function SectionContent({ 
  section, 
  isEditing, 
  onEditChange 
}: { 
  section: SectionType; 
  isEditing: boolean;
  onEditChange: (editing: boolean) => void;
}) {
  switch (section) {
    case 'about':
      return <AboutSection isEditing={isEditing} />;
    case 'videos':
      return <VideosSection isEditing={isEditing} />;
    case 'reels':
      return <ReelsSection isEditing={isEditing} />;
    case 'wedding':
      return <GallerySection section="wedding" isEditing={isEditing} />;
    case 'product':
      return <GallerySection section="product" isEditing={isEditing} />;
    case 'restaurant':
      return <GallerySection section="restaurant" isEditing={isEditing} />;
    case 'contact':
      return <ContactSection isEditing={isEditing} />;
    default:
      return <div className="text-text-secondary">Select a section to manage</div>;
  }
}

// About Section
function AboutSection({ isEditing }: { isEditing: boolean }) {
  const [title, setTitle] = useState('Yousif');
  const [subtitle, setSubtitle] = useState('Photographer & Videographer');
  const [description, setDescription] = useState('Capturing moments that tell your story');
  const [bio, setBio] = useState('Professional photographer with years of experience...');
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80');

  return (
    <div className="space-y-6">
      <div className="bg-dark-section rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Hero Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-dark-section rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">About Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              rows={6}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Background Image URL</label>
            <input
              type="url"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Videos Section
function VideosSection({ isEditing }: { isEditing: boolean }) {
  const [videos, setVideos] = useState([
    { id: 1, title: 'Wedding Highlights', url: '', thumbnail: '' },
    { id: 2, title: 'Portrait Session', url: '', thumbnail: '' },
    { id: 3, title: 'Event Coverage', url: '', thumbnail: '' },
    { id: 4, title: 'Commercial Work', url: '', thumbnail: '' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Videos ({videos.length})</h3>
        {isEditing && (
          <button className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="bg-dark-section rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-text-primary">{video.title}</h4>
              {isEditing && (
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-dark-bg rounded">
                    <Edit2 className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button className="p-1 hover:bg-red-500/10 rounded">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Video URL"
                value={video.url}
                onChange={(e) => {
                  const updated = videos.map(v => v.id === video.id ? { ...v, url: e.target.value } : v);
                  setVideos(updated);
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
              />
              <input
                type="url"
                placeholder="Thumbnail URL"
                value={video.thumbnail}
                onChange={(e) => {
                  const updated = videos.map(v => v.id === video.id ? { ...v, thumbnail: e.target.value } : v);
                  setVideos(updated);
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reels Section
function ReelsSection({ isEditing }: { isEditing: boolean }) {
  const [reels, setReels] = useState([
    { id: 1, title: 'Wedding Reel', video: '', thumbnail: '' },
    { id: 2, title: 'Portrait Reel', video: '', thumbnail: '' },
    { id: 3, title: 'Event Reel', video: '', thumbnail: '' },
    { id: 4, title: 'Fashion Reel', video: '', thumbnail: '' },
    { id: 5, title: 'Lifestyle Reel', video: '', thumbnail: '' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Reels ({reels.length})</h3>
        {isEditing && (
          <button className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Reel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reels.map((reel) => (
          <div key={reel.id} className="bg-dark-section rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-text-primary">{reel.title}</h4>
              {isEditing && (
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-dark-bg rounded">
                    <Edit2 className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button className="p-1 hover:bg-red-500/10 rounded">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Video URL"
                value={reel.video}
                onChange={(e) => {
                  const updated = reels.map(r => r.id === reel.id ? { ...r, video: e.target.value } : r);
                  setReels(updated);
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
              />
              <input
                type="url"
                placeholder="Thumbnail URL"
                value={reel.thumbnail}
                onChange={(e) => {
                  const updated = reels.map(r => r.id === reel.id ? { ...r, thumbnail: e.target.value } : r);
                  setReels(updated);
                }}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Gallery Section (for Wedding, Product, Restaurant)
function GallerySection({ section, isEditing }: { section: string; isEditing: boolean }) {
  const [images, setImages] = useState([
    { id: 1, title: `${section} Image 1`, url: '' },
    { id: 2, title: `${section} Image 2`, url: '' },
    { id: 3, title: `${section} Image 3`, url: '' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Gallery ({images.length})</h3>
        {isEditing && (
          <button className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-dark-section rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-text-primary">{image.title}</h4>
              {isEditing && (
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-dark-bg rounded">
                    <Edit2 className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button className="p-1 hover:bg-red-500/10 rounded">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>
            <input
              type="url"
              placeholder="Image URL"
              value={image.url}
              onChange={(e) => {
                const updated = images.map(img => img.id === image.id ? { ...img, url: e.target.value } : img);
                setImages(updated);
              }}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Contact Section
function ContactSection({ isEditing }: { isEditing: boolean }) {
  const [email, setEmail] = useState('yousif@photography.com');
  const [phone, setPhone] = useState('+1 (234) 567-890');
  const [instagram, setInstagram] = useState('https://instagram.com');
  const [linkedin, setLinkedin] = useState('https://linkedin.com');

  return (
    <div className="space-y-6">
      <div className="bg-dark-section rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Instagram URL</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
