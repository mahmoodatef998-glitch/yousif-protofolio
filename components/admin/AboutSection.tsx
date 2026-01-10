'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Save, ImageIcon, X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AboutSectionProps {
  isEditing: boolean;
}

export function AboutSection({ isEditing }: AboutSectionProps) {
  const [title, setTitle] = useState('Yousif');
  const [subtitle, setSubtitle] = useState('Photographer & Videographer');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [stats, setStats] = useState({ clients: 0, projects: 0, awards: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await fetch('/api/about');
      const { data } = await response.json();
      
      if (data) {
        setTitle(data.hero_title || 'Yousif');
        setSubtitle(data.hero_subtitle || 'Photographer & Videographer');
        setBio(data.bio_text || '');
        setProfileImage(data.profile_image_url || '');
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      logger.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const fileSizeMB = file.size / 1024 / 1024;
    
    logger.log('📤 Starting About section image upload:', {
      fileName: file.name,
      fileSize: `${fileSizeMB.toFixed(2)} MB`,
      fileType: file.type
    });
    
    if (fileSizeMB > 4.5) {
      alert('Image is too large (max 4.5 MB). Please compress or use a smaller image, or use Cloudinary Widget for larger files.');
      return;
    }
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'about');
      formData.append('name', 'profile-image');
      
      logger.log('📤 Uploading to /api/cloudinary/upload:', {
        category: 'about',
        fileName: file.name
      });
      
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        logger.error('❌ Upload failed:', {
          status: response.status,
          error: errorData
        });
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const uploadData = await response.json();
      logger.log('✅ Upload successful:', {
        result: uploadData.result,
        secure_url: uploadData.result?.secure_url,
        url: uploadData.result?.url,
        public_id: uploadData.result?.public_id
      });
      
      const imageUrl = uploadData.result?.secure_url || uploadData.result?.url;
      
      if (!imageUrl) {
        logger.error('❌ No image URL in response:', uploadData);
        throw new Error('Upload successful but no image URL returned');
      }
      
      logger.log('💾 Setting profile image URL:', imageUrl);
      setProfileImage(imageUrl);
      alert('Image uploaded successfully!');
    } catch (error: any) {
      logger.error('❌ Upload error:', error);
      alert(`Failed to upload image: ${error.message || 'Please try again.'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_title: title,
          hero_subtitle: subtitle,
          bio_text: bio,
          profile_image_url: profileImage,
          stats: stats,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('About section saved successfully!');
        // Refresh the data to show updated content
        fetchAbout();
        // Notify other components
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('content-updated');
          channel.postMessage({ type: 'content-updated', section: 'about' });
          channel.close();
        }
      } else {
        const errorMessage = result.error || result.details || 'Failed to save about section';
        logger.error('Save error:', result);
        
        // Check if it's a schema error
        if (result.fixRequired && result.sqlScript) {
          const instructions = result.instructions ? `\n\n📖 ${result.instructions}` : '';
          const altScript = result.alternativeScript ? `\n\nAlternative: ${result.alternativeScript}` : '';
          alert(`Database Schema Error!\n\n${errorMessage}\n\n⚠️ IMPORTANT: Run "${result.sqlScript}" in Supabase SQL Editor${altScript}${instructions}\n\n⏱️ Wait 30-60 seconds after running the script before trying again.`);
        } else {
          alert(`Failed to save: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      logger.error('Error saving about:', error);
      alert(`Failed to save about section: ${error.message || 'Unknown error'}`);
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
            <label className="block text-sm font-medium text-text-secondary mb-2">Profile Image</label>
            
            {/* Drag & Drop Area */}
            {!profileImage ? (
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
                  if (file && file.type.startsWith('image/')) {
                    await handleImageUpload(file);
                  }
                }}
                onClick={() => {
                  if (isEditing) {
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed border-dark-section rounded-lg p-8 text-center transition-colors ${
                  isEditing ? 'cursor-pointer hover:border-accent' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto mb-2 text-accent animate-spin" />
                    <p className="text-text-secondary">Uploading image...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 text-text-secondary" />
                    <p className="text-text-secondary">Drag & drop image here or click to upload</p>
                    <p className="text-xs text-text-secondary mt-1">Max 4.5 MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => setProfileImage('')}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && isEditing) {
                  handleImageUpload(file);
                }
              }}
              className="hidden"
              disabled={!isEditing}
            />
            
            {/* Fallback URL Input */}
            <div className="mt-2">
              <label className="block text-xs text-text-secondary mb-1">Or enter URL:</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                disabled={!isEditing}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Stats</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Clients</label>
                <input
                  type="number"
                  value={stats.clients}
                  onChange={(e) => setStats({ ...stats, clients: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Projects</label>
                <input
                  type="number"
                  value={stats.projects}
                  onChange={(e) => setStats({ ...stats, projects: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Awards</label>
                <input
                  type="number"
                  value={stats.awards}
                  onChange={(e) => setStats({ ...stats, awards: parseInt(e.target.value) || 0 })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-section rounded text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
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

