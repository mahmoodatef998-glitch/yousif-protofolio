'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Edit2, X, Check, Loader2, Plus, Folder, Image as ImageIcon, Video, Grid, Settings } from 'lucide-react';
import { ImageUploadForm } from './ImageUploadForm';

interface Image {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  tags: string[];
  category: string;
  alt: string;
  caption: string;
}

interface CategoryImages {
  [key: string]: Image[];
}

export default function AdminDashboard() {
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<CategoryImages>({});
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [editForm, setEditForm] = useState({ alt: '', caption: '', category: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloudinary/images');
      const data = await response.json();
      setImages(data.images || []);
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Delete image
  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      setDeletingId(publicId);
      const response = await fetch(`/api/cloudinary/images?public_id=${publicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchImages();
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('An error occurred while deleting the image');
    } finally {
      setDeletingId(null);
    }
  };

  // Start editing
  const handleEdit = (image: Image) => {
    setEditingImage(image);
    setEditForm({
      alt: image.alt || '',
      caption: image.caption || '',
      category: image.category || '',
    });
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingImage) return;

    try {
      const response = await fetch('/api/cloudinary/images/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: editingImage.public_id,
          category: editForm.category,
          context: {
            custom: {
              alt: editForm.alt,
              caption: editForm.caption,
            },
          },
        }),
      });

      if (response.ok) {
        await fetchImages();
        setEditingImage(null);
        setEditForm({ alt: '', caption: '', category: '' });
      } else {
        alert('Failed to update image');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('An error occurred while updating the image');
    }
  };

  // Move image to section
  const handleMove = async (image: Image, toSection: string) => {
    if (image.category === toSection) return;

    try {
      const response = await fetch('/api/cloudinary/images/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: image.public_id,
          from_category: image.category,
          to_category: toSection,
        }),
      });

      if (response.ok) {
        await fetchImages();
      } else {
        alert('Failed to move image');
      }
    } catch (error) {
      console.error('Error moving image:', error);
      alert('An error occurred while moving the image');
    }
  };

  // Get all sections
  const allSections = ['all', ...Object.keys(categories)].filter(Boolean);
  const displayedImages = selectedSection === 'all' 
    ? images 
    : (categories[selectedSection] || []);

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Create new section
  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      alert('Please enter a section name');
      return;
    }
    
    // Sections are created automatically when you upload images with a tag
    // For now, just select it
    setSelectedSection(newSectionName.trim().toLowerCase().replace(/\s+/g, '-'));
    setNewSectionName('');
    setShowAddSection(false);
    setActiveTab('upload');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Portfolio Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your portfolio sections and content
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Site
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'upload'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Content
              </div>
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'manage'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Manage Sections
              </div>
              {activeTab === 'manage' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Sections Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Select Section
                </h2>
                <button
                  onClick={() => setShowAddSection(!showAddSection)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Section
                </button>
              </div>

              {showAddSection && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Section name (e.g., Wedding Photography)"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleCreateSection();
                      }}
                    />
                    <button
                      onClick={handleCreateSection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSection(false);
                        setNewSectionName('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 Tip: Section names will be used as tags in Cloudinary. Use simple names like "wedding", "portrait", "events"
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {allSections.map((section) => {
                  const count = section === 'all' ? images.length : (categories[section]?.length || 0);
                  return (
                    <button
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSection === section
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {section === 'all' ? 'All Sections' : section}
                      <span className="ml-2 text-xs opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {selectedSection !== 'all' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📍 <strong>Selected Section:</strong> <span className="font-mono">{selectedSection}</span>
                    <br />
                    <span className="text-xs">Content uploaded below will be added to this section</span>
                  </p>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div>
              <ImageUploadForm
                categories={allSections.filter(s => s !== 'all')}
                defaultCategory={selectedSection !== 'all' ? selectedSection : ''}
                onUploadSuccess={() => {
                  setTimeout(() => {
                    fetchImages();
                    setShowUploadForm(false);
                  }, 1500);
                }}
              />
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Sections Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Grid className="w-5 h-5" />
                All Sections
              </h2>

              {allSections.filter(s => s !== 'all').length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No sections yet</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Section
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSections.filter(s => s !== 'all').map((section) => {
                    const sectionImages = categories[section] || [];
                    const coverImage = sectionImages[0]?.secure_url;
                    return (
                      <div
                        key={section}
                        onClick={() => {
                          setSelectedSection(section);
                          setActiveTab('upload');
                        }}
                        className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={section}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 capitalize">
                          {section}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {sectionImages.length} {sectionImages.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Images Grid for Selected Section */}
            {selectedSection !== 'all' && categories[selectedSection] && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedSection} Section
                  </h2>
                  <span className="text-gray-600 dark:text-gray-400">
                    {displayedImages.length} {displayedImages.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {displayedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No items in this section</p>
                    <button
                      onClick={() => {
                        setActiveTab('upload');
                      }}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Items to This Section
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedImages.map((image) => (
                      <div
                        key={image.public_id}
                        className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
                      >
                        <img
                          src={image.secure_url}
                          alt={image.alt || image.public_id}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(image)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(image.public_id)}
                            disabled={deletingId === image.public_id}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === image.public_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Image Info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">
                          <div className="truncate">{image.alt || 'No title'}</div>
                          <div className="text-gray-300">{formatBytes(image.bytes)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Item</h3>
                  <button
                    onClick={() => setEditingImage(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <img
                    src={editingImage.secure_url}
                    alt={editingImage.alt}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Section
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {allSections.filter(s => s !== 'all').map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (Alt Text)
                    </label>
                    <input
                      type="text"
                      value={editForm.alt}
                      onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Item title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Item description"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingImage(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
