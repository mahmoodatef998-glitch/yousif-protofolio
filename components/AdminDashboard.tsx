'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { UploadSection } from './admin/UploadSection';
import { AboutSection } from './admin/AboutSection';
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
  EyeOff,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Loader2,
  Star,
  Check,
  XCircle,
  RefreshCw,
} from 'lucide-react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

type SectionType = 'about' | 'videos' | 'reels' | 'wedding' | 'product' | 'restaurant' | 'contact' | 'upload' | 'reviews' | 'preview';

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
  { id: 'reviews', name: 'Reviews', icon: Star, description: 'Review and approve user reviews' },
  { id: 'preview', name: 'Preview', icon: Eye, description: 'Manage approved reviews displayed on website' },
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
    case 'reviews':
      return <ReviewsSection />;
    case 'preview':
      return <PreviewSection />;
    default:
      return <div className="text-text-secondary">Select a section to manage</div>;
  }
}

// Imported sections are now in components/admin/
// Upload Section - MOVED TO components/admin/UploadSection.tsx
// About Section - MOVED TO components/admin/AboutSection.tsx

// Videos Section
function VideosSection({ isEditing }: { isEditing: boolean }) {
  const [videos, setVideos] = useState<Array<{
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    description?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const widgetRef = useRef<any>(null);
  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);

  // Load Cloudinary Widget Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (document.querySelector('script[src*="upload-widget.cloudinary.com"]')) {
      setWidgetScriptLoaded(true);
      return;
    }

    if (window.cloudinary) {
      setWidgetScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => setWidgetScriptLoaded(true);
    script.onerror = () => logger.error('Failed to load Cloudinary widget script');

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/content?section=videos');
      const { data } = await response.json();
      
      if (data) {
        const formattedVideos = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled Video',
          url: item.media_url || '',
          thumbnail: item.thumbnail_url || '',
          description: item.description || '',
        }));
        setVideos(formattedVideos);
      }
    } catch (error) {
      logger.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'videos',
          title: 'New Video',
          media_type: 'video',
          media_url: '',
          thumbnail_url: '',
        }),
      });

      if (response.ok) {
        await fetchVideos();
      }
    } catch (error) {
      logger.error('Error adding video:', error);
      alert('Failed to add video');
    }
  };

  const handleVideoUpload = async (file: File, videoId: string) => {
    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB > 200) {
      alert('Video is too large (max 200 MB). Please compress or use a smaller video.');
      return;
    }
    
    setUploadingVideo(videoId);
    
    try {
      // For files <= 4.5MB, use API route
      if (fileSizeMB <= 4.5) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'videos');
        formData.append('name', `video-${videoId}`);
        
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const { result } = await response.json();
        const updated = videos.map(v => 
          v.id === videoId 
            ? { 
                ...v, 
                url: result.secure_url || result.url,
                thumbnail: result.thumbnail_url || result.secure_url || result.url
              }
            : v
        );
        setVideos(updated);
        alert('Video uploaded successfully!');
      } else {
        // For larger files, use Cloudinary Widget
        handleCloudinaryWidgetUpload(videoId);
      }
    } catch (error: any) {
      logger.error('Upload error:', error);
      alert(`Failed to upload video: ${error.message || 'Please try Cloudinary Widget for large files.'}`);
      setUploadingVideo(null);
    }
  };

  const handleCloudinaryWidgetUpload = (videoId: string) => {
    if (!window.cloudinary || !widgetScriptLoaded) {
      alert('Cloudinary widget is loading, please try again in a moment');
      setUploadingVideo(null);
      return;
    }
    
    // Check for required environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName) {
      alert('Error: Cloudinary Cloud Name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
      setUploadingVideo(null);
      return;
    }
    
    if (!uploadPreset) {
      alert('Error: Cloudinary Upload Preset is required for widget uploads.\n\nPlease:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables');
      setUploadingVideo(null);
      return;
    }
    
    // Destroy existing widget if it exists to create a fresh one
    if (widgetRef.current) {
      try {
        widgetRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      widgetRef.current = null;
    }
    
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio',
        multiple: false,
        resourceType: 'video',
        maxFileSize: 200000000, // 200MB in bytes
        clientAllowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        maxImageWidth: 0, // No limit
        maxImageHeight: 0, // No limit
        maxVideoFileSize: 200000000, // 200MB explicitly for videos
        sources: ['local', 'camera', 'url'],
        showAdvancedOptions: true,
        cropping: false,
      },
      async (error: any, result: any) => {
          if (error) {
            logger.error('Cloudinary Widget Upload error:', error);
            let errorMessage = 'Upload error: ';
            if (error.status === 'Upload preset must be specified when using unsigned upload' || error.message?.includes('Upload preset')) {
              errorMessage = 'Error: Upload Preset is required.\n\nPlease add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.\n\nTo create an upload preset:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Copy the preset name and add it to Vercel environment variables';
            } else if (error.message) {
              errorMessage += error.message;
            } else if (error.status === 400) {
              errorMessage += 'File is too large or invalid format. Please check Cloudinary settings.';
            } else {
              errorMessage += 'Unknown error. Please try again or check Cloudinary configuration.';
            }
            alert(errorMessage);
            setUploadingVideo(null);
            return;
          }
        
        if (result && result.event === 'success') {
          const uploadResult = result.info;
          const updated = videos.map(v => 
            v.id === videoId 
              ? { 
                  ...v, 
                  url: uploadResult.secure_url || uploadResult.url,
                  thumbnail: uploadResult.thumbnail_url || uploadResult.secure_url || uploadResult.url
                }
              : v
          );
          setVideos(updated);
          setUploadingVideo(null);
          alert('Video uploaded successfully!');
        } else if (result && result.event === 'close') {
          // User closed the widget
          setUploadingVideo(null);
        }
      }
    );
    
    widgetRef.current.open();
  };

  const handleSave = async (video: typeof videos[0]) => {
    setSaving(video.id);
    try {
      const response = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: video.id,
          title: video.title,
          media_url: video.url,
          thumbnail_url: video.thumbnail,
          description: video.description,
        }),
      });

      if (response.ok) {
        alert('Video saved successfully!');
      } else {
        alert('Failed to save video');
      }
    } catch (error) {
      logger.error('Error saving video:', error);
      alert('Failed to save video');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVideos(videos.filter(v => v.id !== id));
        alert('Video deleted successfully!');
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      logger.error('Error deleting video:', error);
      alert('Failed to delete video');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Videos ({videos.length})</h3>
        {isEditing && (
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-dark-section rounded-lg">
          <p className="text-text-secondary">No videos yet. Add your first video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-dark-section rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={video.title}
                  onChange={(e) => {
                    const updated = videos.map(v => v.id === video.id ? { ...v, title: e.target.value } : v);
                    setVideos(updated);
                  }}
                  disabled={!isEditing}
                  className="flex-1 font-medium text-text-primary bg-transparent border-none focus:outline-none disabled:opacity-50"
                  placeholder="Video Title"
                />
                {isEditing && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(video)}
                      disabled={saving === video.id}
                      className="p-1 hover:bg-dark-bg rounded disabled:opacity-50"
                    >
                      {saving === video.id ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-accent" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleDelete(video.id)}
                      disabled={deleting === video.id}
                      className="p-1 hover:bg-red-500/10 rounded disabled:opacity-50"
                    >
                      {deleting === video.id ? (
                        <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (isEditing) {
                      e.currentTarget.classList.add('border-accent', 'bg-accent/10');
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-accent', 'bg-accent/10');
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-accent', 'bg-accent/10');
                    if (!isEditing) return;
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                      await handleVideoUpload(file, video.id);
                    }
                  }}
                  onClick={() => {
                    if (!isEditing) return;
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file, video.id);
                    };
                    input.click();
                  }}
                  className={`border-2 border-dashed border-dark-section rounded-lg p-4 text-center transition-colors ${
                    isEditing ? 'cursor-pointer hover:border-accent' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {uploadingVideo === video.id ? (
                    <>
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-accent animate-spin" />
                      <p className="text-text-secondary text-sm">Uploading video...</p>
                    </>
                  ) : (
                    <>
                      <Video className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                      <p className="text-text-secondary text-sm">Drag & drop video or click to upload</p>
                      <p className="text-xs text-text-secondary mt-1">Max 200 MB</p>
                    </>
                  )}
                </div>
                
                {/* Cloudinary Widget Button for Large Files */}
                {isEditing && (
                  <button
                    onClick={() => handleCloudinaryWidgetUpload(video.id)}
                    disabled={!widgetScriptLoaded || uploadingVideo === video.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Large Video (Up to 200 MB)
                  </button>
                )}
                
                {/* Fallback URL Input */}
                <input
                  type="url"
                  placeholder="Or enter Video URL"
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
                <textarea
                  placeholder="Description (optional)"
                  value={video.description || ''}
                  onChange={(e) => {
                    const updated = videos.map(v => v.id === video.id ? { ...v, description: e.target.value } : v);
                    setVideos(updated);
                  }}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reels Section
function ReelsSection({ isEditing }: { isEditing: boolean }) {
  const [reels, setReels] = useState<Array<{
    id: string;
    title: string;
    video: string;
    thumbnail: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingReel, setUploadingReel] = useState<string | null>(null);
  const widgetRef = useRef<any>(null);
  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);

  // Load Cloudinary Widget Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (document.querySelector('script[src*="upload-widget.cloudinary.com"]')) {
      setWidgetScriptLoaded(true);
      return;
    }

    if (window.cloudinary) {
      setWidgetScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => setWidgetScriptLoaded(true);
    script.onerror = () => logger.error('Failed to load Cloudinary widget script');

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/content?section=reels');
      const { data } = await response.json();
      
      if (data) {
        const formattedReels = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled Reel',
          video: item.media_url || '',
          thumbnail: item.thumbnail_url || '',
        }));
        setReels(formattedReels);
      }
    } catch (error) {
      logger.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'reels',
          title: 'New Reel',
          media_type: 'video',
          media_url: '',
          thumbnail_url: '',
        }),
      });

      if (response.ok) {
        await fetchReels();
      }
    } catch (error) {
      logger.error('Error adding reel:', error);
      alert('Failed to add reel');
    }
  };

  const handleReelUpload = async (file: File, reelId: string) => {
    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB > 200) {
      alert('Video is too large (max 200 MB). Please compress or use a smaller video.');
      return;
    }
    
    setUploadingReel(reelId);
    
    try {
      // For files <= 4.5MB, use API route
      if (fileSizeMB <= 4.5) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'reels');
        formData.append('name', `reel-${reelId}`);
        
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const { result } = await response.json();
        const updated = reels.map(r => 
          r.id === reelId 
            ? { 
                ...r, 
                video: result.secure_url || result.url,
                thumbnail: result.thumbnail_url || result.secure_url || result.url
              }
            : r
        );
        setReels(updated);
        alert('Reel uploaded successfully!');
      } else {
        // For larger files, use Cloudinary Widget
        handleCloudinaryWidgetUpload(reelId);
      }
    } catch (error: any) {
      logger.error('Upload error:', error);
      alert(`Failed to upload reel: ${error.message || 'Please try Cloudinary Widget for large files.'}`);
      setUploadingReel(null);
    }
  };

  const handleCloudinaryWidgetUpload = (reelId: string) => {
    if (!window.cloudinary || !widgetScriptLoaded) {
      alert('Cloudinary widget is loading, please try again in a moment');
      setUploadingReel(null);
      return;
    }
    
    // Check for required environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName) {
      alert('Error: Cloudinary Cloud Name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
      setUploadingReel(null);
      return;
    }
    
    if (!uploadPreset) {
      alert('Error: Cloudinary Upload Preset is required for widget uploads.\n\nPlease:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables');
      setUploadingReel(null);
      return;
    }
    
    // Destroy existing widget if it exists to create a fresh one
    if (widgetRef.current) {
      try {
        widgetRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      widgetRef.current = null;
    }
    
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio',
        multiple: false,
        resourceType: 'video',
        maxFileSize: 200000000, // 200MB in bytes
        clientAllowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        maxImageWidth: 0, // No limit
        maxImageHeight: 0, // No limit
        maxVideoFileSize: 200000000, // 200MB explicitly for videos
        sources: ['local', 'camera', 'url'],
        showAdvancedOptions: true,
        cropping: false,
      },
      async (error: any, result: any) => {
          if (error) {
            logger.error('Cloudinary Widget Upload error:', error);
            let errorMessage = 'Upload error: ';
            if (error.status === 'Upload preset must be specified when using unsigned upload' || error.message?.includes('Upload preset')) {
              errorMessage = 'Error: Upload Preset is required.\n\nPlease add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.\n\nTo create an upload preset:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Copy the preset name and add it to Vercel environment variables';
            } else if (error.message) {
              errorMessage += error.message;
            } else if (error.status === 400) {
              errorMessage += 'File is too large or invalid format. Please check Cloudinary settings.';
            } else {
              errorMessage += 'Unknown error. Please try again or check Cloudinary configuration.';
            }
            alert(errorMessage);
            setUploadingReel(null);
            return;
          }
        
        if (result && result.event === 'success') {
          const uploadResult = result.info;
          const updated = reels.map(r => 
            r.id === reelId 
              ? { 
                  ...r, 
                  video: uploadResult.secure_url || uploadResult.url,
                  thumbnail: uploadResult.thumbnail_url || uploadResult.secure_url || uploadResult.url
                }
              : r
          );
          setReels(updated);
          setUploadingReel(null);
          alert('Reel uploaded successfully!');
        } else if (result && result.event === 'close') {
          // User closed the widget
          setUploadingReel(null);
        }
      }
    );
    
    widgetRef.current.open();
  };

  const handleSave = async (reel: typeof reels[0]) => {
    setSaving(reel.id);
    try {
      const response = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reel.id,
          title: reel.title,
          media_url: reel.video,
          thumbnail_url: reel.thumbnail,
        }),
      });

      if (response.ok) {
        alert('Reel saved successfully!');
      } else {
        alert('Failed to save reel');
      }
    } catch (error) {
      logger.error('Error saving reel:', error);
      alert('Failed to save reel');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReels(reels.filter(r => r.id !== id));
        alert('Reel deleted successfully!');
      } else {
        alert('Failed to delete reel');
      }
    } catch (error) {
      logger.error('Error deleting reel:', error);
      alert('Failed to delete reel');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Reels ({reels.length})</h3>
        {isEditing && (
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Reel
          </button>
        )}
      </div>

      {reels.length === 0 ? (
        <div className="text-center py-12 bg-dark-section rounded-lg">
          <p className="text-text-secondary">No reels yet. Add your first reel!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-dark-section rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={reel.title}
                  onChange={(e) => {
                    const updated = reels.map(r => r.id === reel.id ? { ...r, title: e.target.value } : r);
                    setReels(updated);
                  }}
                  disabled={!isEditing}
                  className="flex-1 font-medium text-text-primary bg-transparent border-none focus:outline-none disabled:opacity-50"
                  placeholder="Reel Title"
                />
                {isEditing && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(reel)}
                      disabled={saving === reel.id}
                      className="p-1 hover:bg-dark-bg rounded disabled:opacity-50"
                    >
                      {saving === reel.id ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-accent" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleDelete(reel.id)}
                      disabled={deleting === reel.id}
                      className="p-1 hover:bg-red-500/10 rounded disabled:opacity-50"
                    >
                      {deleting === reel.id ? (
                        <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (isEditing) {
                      e.currentTarget.classList.add('border-accent', 'bg-accent/10');
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-accent', 'bg-accent/10');
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-accent', 'bg-accent/10');
                    if (!isEditing) return;
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) {
                      await handleReelUpload(file, reel.id);
                    }
                  }}
                  onClick={() => {
                    if (!isEditing) return;
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) handleReelUpload(file, reel.id);
                    };
                    input.click();
                  }}
                  className={`border-2 border-dashed border-dark-section rounded-lg p-4 text-center transition-colors ${
                    isEditing ? 'cursor-pointer hover:border-accent' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {uploadingReel === reel.id ? (
                    <>
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-accent animate-spin" />
                      <p className="text-text-secondary text-sm">Uploading reel...</p>
                    </>
                  ) : (
                    <>
                      <Film className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                      <p className="text-text-secondary text-sm">Drag & drop video or click to upload</p>
                      <p className="text-xs text-text-secondary mt-1">Max 200 MB</p>
                    </>
                  )}
                </div>
                
                {/* Cloudinary Widget Button for Large Files */}
                {isEditing && (
                  <button
                    onClick={() => handleCloudinaryWidgetUpload(reel.id)}
                    disabled={!widgetScriptLoaded || uploadingReel === reel.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Large Video (Up to 200 MB)
                  </button>
                )}
                
                {/* Fallback URL Input */}
                <input
                  type="url"
                  placeholder="Or enter Video URL"
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
      )}
    </div>
  );
}

// Gallery Section (for Wedding, Product, Restaurant)
function GallerySection({ section, isEditing }: { section: string; isEditing: boolean }) {
  const [images, setImages] = useState<Array<{
    id: string;
    title: string;
    url: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
    
    // Listen for content updates from upload section
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('content-updated');
      channel.onmessage = (event) => {
        if (event.data.type === 'content-updated' && 
            (event.data.section === section || !event.data.section)) {
          logger.debug(`Content updated for section: ${section}, refreshing...`);
          fetchImages();
        }
      };
    }
    
    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, [section]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      logger.debug(`Fetching images for section: ${section}`);
      const response = await fetch(`/api/content?section=${section}`, {
        cache: 'no-store', // Ensure fresh data
      });
      
      if (!response.ok) {
        logger.error(`Failed to fetch ${section} images:`, response.status, response.statusText);
        setImages([]);
        return;
      }
      
      const result = await response.json();
      const data = result.data || result;
      
      logger.debug(`Fetched ${section} images:`, data?.length || 0);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const formattedImages = data
          .filter((item: any) => item.media_url && item.media_url.trim() !== '')
          .map((item: any) => {
            const url = item.media_url || '';
            logger.debug(`Image ${item.id} (${item.title}): URL length = ${url.length}`);
            return {
              id: item.id,
              title: item.title || 'Untitled Image',
              url: url,
            };
          });
        logger.debug(`Formatted ${section} images:`, formattedImages.length);
        setImages(formattedImages);
      } else {
        logger.warn(`No ${section} images found in database`);
        setImages([]);
      }
    } catch (error) {
      logger.error(`Error fetching ${section} images:`, error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: section,
          title: 'New Image',
          media_type: 'image',
          media_url: '',
        }),
      });

      if (response.ok) {
        await fetchImages();
      }
    } catch (error) {
      logger.error('Error adding image:', error);
      alert('Failed to add image');
    }
  };

  const handleSave = async (image: typeof images[0]) => {
    setSaving(image.id);
    try {
      const response = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: image.id,
          title: image.title,
          media_url: image.url,
        }),
      });

      if (response.ok) {
        alert('Image saved successfully!');
      } else {
        alert('Failed to save image');
      }
    } catch (error) {
      logger.error('Error saving image:', error);
      alert('Failed to save image');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter(img => img.id !== id));
        alert('Image deleted successfully!');
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      logger.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Gallery ({images.length})</h3>
        {isEditing && (
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-accent text-dark-bg rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-dark-section rounded-lg">
          <p className="text-text-secondary">No images yet. Add your first image!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-dark-section rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  value={image.title}
                  onChange={(e) => {
                    const updated = images.map(img => img.id === image.id ? { ...img, title: e.target.value } : img);
                    setImages(updated);
                  }}
                  disabled={!isEditing}
                  className="flex-1 font-medium text-text-primary bg-transparent border-none focus:outline-none disabled:opacity-50"
                  placeholder="Image Title"
                />
                {isEditing && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(image)}
                      disabled={saving === image.id}
                      className="p-1 hover:bg-dark-bg rounded disabled:opacity-50"
                    >
                      {saving === image.id ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-accent" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleDelete(image.id)}
                      disabled={deleting === image.id}
                      className="p-1 hover:bg-red-500/10 rounded disabled:opacity-50"
                    >
                      {deleting === image.id ? (
                        <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
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
                title={image.url} // Show full URL on hover
              />
              {image.url && (
                <div className="text-xs text-text-secondary mt-1 truncate" title={image.url}>
                  {image.url.length > 60 ? `${image.url.substring(0, 60)}...` : image.url}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Contact Section
function ContactSection({ isEditing }: { isEditing: boolean }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await fetch('/api/contact');
      const { data } = await response.json();
      
      if (data) {
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setInstagram(data.instagram_url || '');
        setLinkedin(data.linkedin_url || '');
      }
    } catch (error) {
      logger.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          instagram_url: instagram,
          linkedin_url: linkedin,
        }),
      });

      if (response.ok) {
        alert('Contact information saved successfully!');
      } else {
        alert('Failed to save contact information');
      }
    } catch (error) {
      logger.error('Error saving contact:', error);
      alert('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

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

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Reviews Section Component
function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/pending');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        logger.error('Failed to fetch pending reviews');
      }
    } catch (error) {
      logger.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string, approve: boolean) => {
    try {
      setProcessing(reviewId);
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, approve }),
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        alert(approve ? 'Review approved successfully!' : 'Review rejected and deleted.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to process review'}`);
      }
    } catch (error: any) {
      logger.error('Error processing review:', error);
      alert(`Error: ${error.message || 'Failed to process review'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">No Pending Reviews</h3>
        <p className="text-text-secondary">All reviews have been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-dark-section rounded-lg p-4 border border-dark-bg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-text-primary">Pending Reviews</h3>
          <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
        <p className="text-sm text-text-secondary">
          Review and approve user-submitted reviews before they appear on the website.
        </p>
      </div>

      <div className="grid gap-6">
        {reviews.map((review) => {
          const contentItem = Array.isArray(review.content_items) 
            ? review.content_items[0] 
            : review.content_items;
          const section = contentItem?.sections 
            ? (Array.isArray(contentItem.sections) ? contentItem.sections[0] : contentItem.sections)
            : null;

          return (
            <div
              key={review.id}
              className="bg-dark-section rounded-lg p-6 border border-dark-bg hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'text-text-secondary/20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {review.rating}/5
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-text-primary font-semibold mb-1">
                      {review.user_name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-text-secondary leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  {contentItem && (
                    <div className="mt-4 pt-4 border-t border-dark-bg">
                      <p className="text-sm text-text-secondary mb-1">
                        <span className="font-medium">Content:</span> {contentItem.title || 'Untitled'}
                      </p>
                      {section && (
                        <p className="text-sm text-text-secondary">
                          <span className="font-medium">Section:</span> {section.title || section.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(review.id, true)}
                    disabled={processing === review.id}
                    className="px-4 py-2 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {processing === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to reject and delete this review?')) {
                        handleApprove(review.id, false);
                      }
                    }}
                    disabled={processing === review.id}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {processing === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Preview Section - Manage approved reviews displayed on website
function PreviewSection() {
  const [approvedReviews, setApprovedReviews] = useState<Array<{
    id: string;
    content_item_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    content_items?: {
      title: string;
      media_type: string;
      sections?: {
        name: string;
      };
    };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/approved');
      if (response.ok) {
        const data = await response.json();
        setApprovedReviews(data.reviews || []);
      }
    } catch (error) {
      logger.error('Error fetching approved reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review from the preview? It will be removed from the website.')) {
      return;
    }

    try {
      setProcessing(reviewId);
      const response = await fetch('/api/reviews/approve', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        setApprovedReviews((prev) => prev.filter((r) => r.id !== reviewId));
        // Notify frontend to refresh
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('content-updated');
          channel.postMessage({ type: 'content-updated', section: 'testimonials' });
          channel.close();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete review'}`);
      }
    } catch (error) {
      logger.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setProcessing(null);
    }
  };

  const handleUnapprove = async (reviewId: string) => {
    if (!confirm('Are you sure you want to unapprove this review? It will be removed from the website and moved back to pending reviews.')) {
      return;
    }

    try {
      setProcessing(reviewId);
      const response = await fetch('/api/reviews/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, isApproved: false }),
      });

      if (response.ok) {
        setApprovedReviews((prev) => prev.filter((r) => r.id !== reviewId));
        // Notify frontend to refresh
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('content-updated');
          channel.postMessage({ type: 'content-updated', section: 'testimonials' });
          channel.close();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to unapprove review'}`);
      }
    } catch (error) {
      logger.error('Error unapproving review:', error);
      alert('Failed to unapprove review');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Preview Reviews</h2>
          <p className="text-text-secondary">
            Manage approved reviews displayed on the website. These reviews appear in the "What Clients Say" section.
          </p>
        </div>
        <button
          onClick={fetchApprovedReviews}
          className="px-4 py-2 bg-accent text-dark-bg rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {approvedReviews.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No approved reviews to preview.</p>
          <p className="text-sm mt-2">Approve reviews from the "Reviews" section to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-dark-bg/50 backdrop-blur-sm rounded-xl p-6 border border-dark-section/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-text-primary font-semibold">{review.user_name || 'Anonymous'}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'fill-dark-section text-dark-section'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.content_items && (
                    <p className="text-xs text-text-secondary mb-1">
                      {review.content_items.sections?.name || 'General'} • {review.content_items.title}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-text-secondary text-sm mb-4 line-clamp-3">{review.comment}</p>

              <div className="flex items-center justify-between pt-4 border-t border-dark-section/50">
                <span className="text-xs text-text-secondary">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUnapprove(review.id)}
                    disabled={processing === review.id}
                    className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-semibold hover:bg-yellow-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="Unapprove and move back to pending"
                  >
                    {processing === review.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    Unapprove
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={processing === review.id}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="Delete permanently"
                  >
                    {processing === review.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
