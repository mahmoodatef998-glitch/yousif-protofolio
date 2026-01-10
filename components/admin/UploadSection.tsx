'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [category, setCategory] = useState('wedding');
  const [imageName, setImageName] = useState('');
  const [groupMode, setGroupMode] = useState<'none' | 'group'>('none');
  const [groupName, setGroupName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<any>(null);
  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);

  const categories = ['wedding', 'product', 'restaurant', 'videos', 'reels'];

  // Load Cloudinary Widget Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (document.querySelector('script[src*="upload-widget.cloudinary.com"]')) {
      setWidgetScriptLoaded(true);
      return;
    }

    // Check if cloudinary is already available
    if (window.cloudinary) {
      setWidgetScriptLoaded(true);
      return;
    }

    // Load Cloudinary widget script
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setWidgetScriptLoaded(true);
    };

    script.onerror = () => {
      logger.error('Failed to load Cloudinary widget script');
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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

    // Generate group_id once for all files if group mode is enabled
    // Use consistent format: groupName-timestamp-randomString
    // IMPORTANT: Each upload batch gets a UNIQUE group_id to avoid mixing with old groups
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const currentGroupId = groupMode === 'group' 
      ? (groupName ? `${groupName}-${timestamp}-${randomString}` : `group-${timestamp}-${randomString}`)
      : null;
    
    logger.log(`🔑 Generated UNIQUE group_id for this batch:`, {
      group_id: currentGroupId,
      groupMode,
      groupName: groupName || 'auto-generated',
      timestamp,
      randomString,
      fileCount: selectedFiles.length,
      files: selectedFiles.map(f => f.name)
    });

    try {
      logger.log(`🚀 Starting upload of ${selectedFiles.length} file(s) to category: ${category}`, {
        groupMode,
        groupName: groupName || 'none',
        group_id: currentGroupId || 'none (individual)',
        files: selectedFiles.map(f => f.name)
      });
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = selectedFiles.length === 1 
          ? imageName || file.name.replace(/\.[^/.]+$/, '')
          : `${imageName || 'image'}-${i + 1}`;

        const fileSizeMB = file.size / 1024 / 1024;
        const maxSizeMB = 4.5; // Vercel's limit
        
        logger.debug(`Uploading file ${i + 1}/${selectedFiles.length}: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);

        // Check file size before upload
        if (fileSizeMB > maxSizeMB) {
          const errorMsg = `File "${file.name}" is too large (${fileSizeMB.toFixed(2)} MB). Maximum allowed size is ${maxSizeMB} MB. Please compress the file or use Cloudinary Upload Widget for larger files.`;
          logger.error(errorMsg);
          alert(errorMsg);
          continue; // Skip this file and continue with others
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('name', fileName);

        progress[file.name] = 0;
        setUploadProgress({ ...progress });

        try {
          // Use fetch instead of XMLHttpRequest so it shows in network tab
          const uploadResponse = await fetch('/api/cloudinary/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }));
            logger.error('Upload failed:', errorData);
            
            // Handle 413 (Content Too Large) specifically
            if (uploadResponse.status === 413) {
              const errorMsg = errorData.details || errorData.error || 'File too large';
              throw new Error(`File "${file.name}" is too large. ${errorMsg}`);
            }
            
            throw new Error(`Upload failed for ${file.name}: ${errorData.error || errorData.details || 'Unknown error'}`);
          }

          progress[file.name] = 100;
          setUploadProgress({ ...progress });

          const uploadData = await uploadResponse.json();
          logger.debug('Upload successful:', uploadData);
          const uploadResult = uploadData.result;
          
          if (!uploadResult) {
            throw new Error(`Upload response missing result for ${file.name}`);
          }
          
          // Save to Supabase
          logger.log(`💾 Saving ${file.name} to database`, {
            fileName,
            section: category,
            group_id: currentGroupId || 'none (individual)',
            fileIndex: i + 1,
            totalFiles: selectedFiles.length
          });
          const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
          const saveResponse = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              section: category,
              title: fileName,
              media_type: mediaType,
              media_url: uploadResult.secure_url || uploadResult.url,
              thumbnail_url: uploadResult.secure_url || uploadResult.url,
              cloudinary_public_id: uploadResult.public_id,
              group_id: currentGroupId,
              metadata: {
                format: uploadResult.format,
                width: uploadResult.width,
                height: uploadResult.height,
                bytes: uploadResult.bytes,
              },
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
            logger.error('Failed to save to database:', errorData);
            throw new Error(`Failed to save ${file.name} to database: ${errorData.error || 'Unknown error'}`);
          }
          
          const savedData = await saveResponse.json();
          logger.log(`✅ Successfully saved ${file.name} to database`, {
            id: savedData?.id,
            group_id: currentGroupId || 'none',
            fileIndex: i + 1,
            totalFiles: selectedFiles.length
          });
        } catch (error: any) {
          logger.error(`Error uploading ${file.name}:`, error);
          throw error; // Re-throw to be caught by outer catch
        }
      }

      // Show success message with group info
      if (currentGroupId) {
        alert(`✅ All files uploaded successfully!\n\n📦 Group ID: ${currentGroupId}\n\nAll ${selectedFiles.length} file(s) have been grouped together. Click on the main image to view all images in the group.\n\nThe homepage will automatically update within 30 seconds, or you can refresh it manually.`);
      } else {
        alert(`✅ All ${selectedFiles.length} file(s) uploaded successfully! The homepage will automatically update within 30 seconds, or you can refresh it manually.`);
      }
      
      setSelectedFiles([]);
      setImageName('');
      setGroupMode('none');
      setGroupName('');
      
      // Broadcast message to refresh immediately (if open)
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('content-updated');
        channel.postMessage({ type: 'content-updated', section: category });
        logger.debug(`Broadcasted content-updated for section: ${category}`);
        channel.close();
      }
      
      // Also trigger a page refresh for the gallery section if it's currently open
      // This will be handled by the BroadcastChannel listener in GallerySection
    } catch (error: any) {
      logger.error('Upload error:', error);
      alert(`Upload failed: ${error.message || 'Unknown error'}\n\nPlease check the browser console and network tab for more details.`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Handle Cloudinary Widget Upload for large files (up to 200MB)
  const handleCloudinaryWidgetUpload = () => {
    if (!category) {
      alert('Please select a category first');
      return;
    }

    if (!window.cloudinary || !widgetScriptLoaded) {
      alert('Cloudinary widget is loading, please try again in a moment');
      return;
    }

    // Check for required environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName) {
      alert('Error: Cloudinary Cloud Name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
      return;
    }
    
    if (!uploadPreset) {
      alert('Error: Cloudinary Upload Preset is required for widget uploads.\n\nPlease:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables');
      return;
    }

    // Generate group_id once for all files if group mode is enabled
    // Use UUID-like format to ensure uniqueness even with same group name
    // IMPORTANT: Each upload batch gets a UNIQUE group_id to avoid mixing with old groups
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const currentGroupId = groupMode === 'group' 
      ? (groupName ? `${groupName}-${timestamp}-${randomString}` : `group-${timestamp}-${randomString}`)
      : null;
    
    logger.log(`🚀 Starting Cloudinary Widget upload`, {
      category,
      groupMode,
      group_id: currentGroupId || 'none (individual)',
      groupName: groupName || 'auto-generated',
      timestamp,
      randomString
    });
    
    // Store group_id in widget ref for access in callbacks
    // This ensures ALL files uploaded in this widget session get the SAME group_id
    if (!widgetRef.current) {
      (widgetRef.current as any) = { groupId: currentGroupId };
    } else {
      (widgetRef.current as any).groupId = currentGroupId;
    }
    
    logger.log(`💾 Stored group_id in widget ref:`, (widgetRef.current as any)?.groupId);

    // Destroy existing widget if it exists to create a fresh one
    if (widgetRef.current) {
      try {
        widgetRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      widgetRef.current = null;
    }

    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio';
    
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: `${folder}/${category}`,
        multiple: true,
        resourceType: 'auto',
        maxFileSize: 200000000, // 200MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
        cropping: false,
        showAdvancedOptions: true,
        tags: [category],
      },
      async (error: any, result: any) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            alert('Upload error: ' + (error.message || 'Unknown error'));
            return;
          }

          // Get group_id from widget ref (persisted across callbacks)
          const widgetGroupId = (widgetRef.current as any)?.groupId || currentGroupId;
          
          logger.debug(`📦 Widget callback - event: ${result?.event}, group_id from ref: ${widgetGroupId}`);
          
          if (result && result.event === 'success') {
            logger.log(`✅ Cloudinary upload successful`, {
              fileName: result.info.original_filename,
              publicId: result.info.public_id,
              secureUrl: result.info.secure_url?.substring(0, 50) + '...',
              group_id: widgetGroupId || 'none (individual)',
              category,
              resourceType: result.info.resource_type,
              bytes: result.info.bytes
            });
            
            try {
              // Save to Supabase automatically
              const mediaType = result.info.resource_type === 'video' ? 'video' : 'image';
              const fileName = result.info.original_filename || result.info.public_id.split('/').pop();
              
              const savePayload = {
                section: category,
                title: fileName,
                media_type: mediaType,
                media_url: result.info.secure_url || result.info.url,
                thumbnail_url: result.info.thumbnail_url || result.info.secure_url || result.info.url,
                cloudinary_public_id: result.info.public_id,
                group_id: widgetGroupId, // Use persisted group_id
                metadata: {
                  format: result.info.format,
                  width: result.info.width,
                  height: result.info.height,
                  bytes: result.info.bytes,
                  duration: result.info.duration,
                },
              };
              
              logger.log(`💾 Saving to database`, {
                fileName,
                mediaType,
                section: category,
                group_id: widgetGroupId || 'none (individual)',
                media_url: savePayload.media_url.substring(0, 50) + '...',
                cloudinary_public_id: savePayload.cloudinary_public_id
              });
              
              const saveResponse = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savePayload),
              });

              if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
                logger.error('❌ Failed to save to database:', errorData);
                alert(`Upload successful but failed to save to database: ${errorData.error || 'Unknown error'}`);
                return;
              }

              const savedData = await saveResponse.json();
              logger.log(`✅ Saved to database successfully`, {
                id: savedData?.id,
                title: savedData?.title,
                group_id: widgetGroupId || 'none',
                media_url: savedData?.media_url?.substring(0, 50) + '...',
                created_at: savedData?.created_at
              });
              
              // Verify the saved data has the correct group_id
              if (widgetGroupId && savedData?.group_id !== widgetGroupId) {
                logger.error(`⚠️ WARNING: Saved group_id mismatch!`, {
                  expected: widgetGroupId,
                  actual: savedData?.group_id,
                  savedId: savedData?.id
                });
              }
              
              // Notify other components
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const channel = new BroadcastChannel('content-updated');
                channel.postMessage({ type: 'content-updated', section: category });
                channel.close();
              }

              // Show success message with group info
              if (widgetGroupId) {
                alert(`✅ Upload successful! "${fileName}" has been saved to ${category} section.\n\n📦 Group ID: ${widgetGroupId}\n\nAll files uploaded in this batch will be grouped together.`);
              } else {
                alert(`✅ Upload successful! "${fileName}" has been saved to ${category} section.`);
              }
            } catch (saveError: any) {
              logger.error('❌ Error saving to database:', saveError);
              alert(`Upload successful but failed to save to database: ${saveError.message || 'Unknown error'}`);
            }
          }

          if (result && result.event === 'close') {
            logger.log('Widget closed');
            // Clear group_id from widget ref
            if (widgetRef.current) {
              (widgetRef.current as any).groupId = null;
            }
          }
        }
      );
    
    widgetRef.current.open();
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

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Group Mode *
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="groupMode"
                    value="none"
                    checked={groupMode === 'none'}
                    onChange={(e) => {
                      setGroupMode(e.target.value as 'none' | 'group');
                      if (e.target.value === 'none') setGroupName('');
                    }}
                    className="w-4 h-4 text-accent focus:ring-accent"
                    disabled={uploading}
                  />
                  <span className="text-text-primary">None (Individual)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="groupMode"
                    value="group"
                    checked={groupMode === 'group'}
                    onChange={(e) => setGroupMode(e.target.value as 'none' | 'group')}
                    className="w-4 h-4 text-accent focus:ring-accent"
                    disabled={uploading}
                  />
                  <span className="text-text-primary">Group</span>
                </label>
              </div>
              {groupMode === 'group' && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
                  <div>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name (optional, auto-generated if empty)"
                      className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary focus:border-accent focus:outline-none disabled:opacity-50 text-sm"
                      disabled={uploading}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-text-primary font-medium">
                      📦 Grouping Instructions:
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside ml-2">
                      <li>All {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : 'uploaded'} files will be grouped together</li>
                      <li>Only the first image will be displayed in the gallery</li>
                      <li>Click on the grouped image to view all images in the group</li>
                      <li>Works with both regular upload and Cloudinary Widget</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
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
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'Files'} (Max 4.5 MB)
              </>
              )}
            </button>

            {/* Cloudinary Widget Button for Large Files */}
            <div className="mt-4 pt-4 border-t border-dark-section">
              <p className="text-sm text-text-secondary mb-3 text-center">
                For files larger than 4.5 MB (up to 200 MB), use Cloudinary Widget:
              </p>
              <button
                onClick={handleCloudinaryWidgetUpload}
                disabled={!category || !widgetScriptLoaded || uploading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Large Files (Up to 200 MB)
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

