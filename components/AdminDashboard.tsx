'use client';

import { useState, useEffect, useRef } from 'react';
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
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type SectionType = 'about' | 'videos' | 'reels' | 'wedding' | 'product' | 'restaurant' | 'contact' | 'upload';

interface Section {
  id: SectionType;
  name: string;
  icon: any;
  description: string;
}

const sections: Section[] = [
  { id: 'upload', name: 'Upload', icon: Upload, description: 'Upload images and videos' },
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
  const [activeSection, setActiveSection] = useState<SectionType>('upload');
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
            {activeSection !== 'upload' && (
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
            )}
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
    case 'upload':
      return <UploadSection />;
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

// Upload Section with Drag and Drop
function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [category, setCategory] = useState('wedding');
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['wedding', 'product', 'restaurant', 'videos', 'reels'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    if (!category) {
      alert('Please select a category');
      return;
    }
    
    setUploading(true);
    const progress: { [key: string]: number } = {};

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = selectedFiles.length === 1 
          ? imageName || file.name.replace(/\.[^/.]+$/, '')
          : `${imageName || 'image'}-${i + 1}`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('name', fileName);

        progress[file.name] = 0;
        setUploadProgress({ ...progress });

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progress[file.name] = percentComplete;
            setUploadProgress({ ...progress });
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              progress[file.name] = 100;
              setUploadProgress({ ...progress });
              resolve();
            } else {
              reject(new Error(`Upload failed for ${file.name}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error(`Upload failed for ${file.name}`));
          };

          xhr.open('POST', '/api/cloudinary/upload');
          xhr.send(formData);
        });
      }

      setSelectedFiles([]);
      setImageName('');
      alert('Files uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

    return (
    <div className="space-y-6">
      <div className="bg-dark-section rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Images/Videos</h3>

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            isDragging
              ? 'border-accent bg-accent/10'
              : 'border-dark-section hover:border-accent/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-accent/20' : 'bg-dark-bg'
            }`}>
              <Upload className={`w-10 h-10 ${isDragging ? 'text-accent' : 'text-text-secondary'}`} />
            </div>
            <p className="text-text-primary font-medium mb-2 text-lg">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-text-secondary text-sm mb-4">
              or click to browse
            </p>
            <p className="text-text-secondary text-xs">
              Supports images and videos (multiple files)
            </p>
          </label>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-dark-bg rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageIcon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{file.name}</p>
                      <p className="text-xs text-text-secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {uploading && uploadProgress[file.name] !== undefined ? (
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-dark-section rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary w-10">
                        {Math.round(uploadProgress[file.name])}%
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-500/10 rounded text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Image/Video Name {selectedFiles.length > 1 && '(will be used as prefix)'}
            </label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder={selectedFiles.length > 1 ? "e.g., wedding-photos" : "e.g., wedding-photo-1"}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
              disabled={uploading}
            />
        </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category/Section *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
              disabled={uploading}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0 || !category}
            className="w-full px-6 py-3 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'Files'}
              </>
              )}
            </button>
          </div>
        </div>
    </div>
  );
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
