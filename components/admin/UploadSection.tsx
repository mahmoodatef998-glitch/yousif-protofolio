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
  const [videoCaption, setVideoCaption] = useState(''); // Caption for videos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<any>(null);
  const [widgetScriptLoaded, setWidgetScriptLoaded] = useState(false);

  const categories = ['wedding', 'product', 'restaurant', 'videos', 'reels', 'about'];

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
    // Use consistent format: groupName-timestamp-UUID
    // IMPORTANT: Each upload batch gets a UNIQUE group_id to avoid mixing with old groups
    // Using UUID ensures absolute uniqueness even if multiple uploads happen at the same millisecond
    const timestamp = Date.now();
    const uuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    const currentGroupId = groupMode === 'group' 
      ? (groupName ? `${groupName}-${timestamp}-${uuid}` : `group-${timestamp}-${uuid}`)
      : null;
    
    // If group mode and groupName is provided, check for old images with same group name pattern
    // and ask user if they want to delete them
    if (groupMode === 'group' && groupName && category !== 'about') {
      try {
        const checkResponse = await fetch(`/api/content?section=${category}`);
        const checkData = await checkResponse.json();
        const existingImages = checkData.data || [];
        
        // Find images with group_id that starts with the same groupName
        const oldGroupImages = existingImages.filter((img: any) => 
          img.group_id && img.group_id.startsWith(`${groupName}-`)
        );
        
        if (oldGroupImages.length > 0) {
          const shouldDelete = confirm(
            `⚠️ Found ${oldGroupImages.length} old image(s) with group name "${groupName}".\n\n` +
            `Do you want to delete them before uploading new ones?\n\n` +
            `Click OK to delete old images, or Cancel to keep them (they will appear together with new images).`
          );
          
          if (shouldDelete) {
            logger.log(`🗑️ Deleting ${oldGroupImages.length} old images with group name "${groupName}"`);
            for (const img of oldGroupImages) {
              try {
                await fetch(`/api/content?id=${img.id}`, { method: 'DELETE' });
                logger.log(`✅ Deleted old image: ${img.id} - ${img.title}`);
              } catch (error) {
                logger.error(`Failed to delete old image ${img.id}:`, error);
              }
            }
            logger.log(`✅ Deleted ${oldGroupImages.length} old images`);
          }
        }
      } catch (error) {
        logger.warn('Could not check for old images:', error);
        // Continue with upload even if check fails
      }
    }
    
    logger.log(`🔑 Generated UNIQUE group_id for this batch:`, {
      group_id: currentGroupId,
      groupMode,
      groupName: groupName || 'auto-generated',
      timestamp,
      uuid: uuid.substring(0, 20) + '...',
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
          const imageUrl = uploadResult.secure_url || uploadResult.url;
          
          // Special handling for 'about' category - save directly to about_content
          if (category === 'about') {
            logger.log(`📝 Saving to About section (profile_image_url)`);
            const aboutResponse = await fetch('/api/about', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profile_image_url: imageUrl,
              }),
            });
            
            if (!aboutResponse.ok) {
              const errorData = await aboutResponse.json().catch(() => ({ error: 'Unknown error' }));
              logger.error('Failed to save to About section:', errorData);
              throw new Error(`Failed to save ${file.name} to About section: ${errorData.error || 'Unknown error'}`);
            }
            
            const aboutData = await aboutResponse.json();
            logger.log(`✅ Saved to About section successfully:`, aboutData);
            
            // Notify About component to refresh immediately
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const channel = new BroadcastChannel('content-updated');
              channel.postMessage({ type: 'content-updated', section: 'about' });
              channel.close();
              logger.log(`📢 Broadcasted content-updated for About section`);
            }
          } else {
            // Regular content items
            const saveResponse = await fetch('/api/content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                section: category,
                title: category === 'videos' && videoCaption.trim() ? videoCaption.trim() : fileName,
                media_type: mediaType,
                media_url: imageUrl,
                thumbnail_url: imageUrl,
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
          }
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
      // Clear video caption after successful upload
      if (category === 'videos') {
        setVideoCaption('');
      }
      
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
    
    logger.log('🔧 Cloudinary Widget Configuration Check:', {
      cloudName: cloudName ? '✅ Set' : '❌ Missing',
      uploadPreset: uploadPreset ? `✅ Set (${uploadPreset})` : '❌ Missing',
      category
    });
    
    if (!cloudName) {
      alert('Error: Cloudinary Cloud Name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
      return;
    }
    
    if (!uploadPreset) {
      alert('Error: Cloudinary Upload Preset is required for widget uploads.\n\nPlease:\n1. Go to Cloudinary Dashboard\n2. Settings → Upload → Upload presets\n3. Create an unsigned upload preset\n4. Add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables');
      return;
    }
    
    logger.log('✅ Cloudinary Widget configuration OK, opening widget...');

    // Generate group_id once for all files if group mode is enabled
    // Use UUID format to ensure absolute uniqueness even with same group name
    // IMPORTANT: Each upload batch gets a UNIQUE group_id to avoid mixing with old groups
    const timestamp = Date.now();
    const uuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    const currentGroupId = groupMode === 'group' 
      ? (groupName ? `${groupName}-${timestamp}-${uuid}` : `group-${timestamp}-${uuid}`)
      : null;
    
    logger.log(`🚀 Starting Cloudinary Widget upload`, {
      category,
      groupMode,
      group_id: currentGroupId || 'none (individual)',
      groupName: groupName || 'auto-generated',
      timestamp,
      uuid: uuid.substring(0, 20) + '...'
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
    
    const widgetConfig = {
      cloudName: cloudName,
      uploadPreset: uploadPreset,
      folder: `${folder}/${category}`,
      multiple: true,
      resourceType: 'auto' as const,
      maxFileSize: 200000000, // 200MB
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
      cropping: false,
      showAdvancedOptions: false, // Disable advanced options to prevent library access
      tags: [category],
      // CRITICAL: Restrict to local files only to prevent uploading from Cloudinary Library or other sources
      sources: ['local'], // Only allow local file uploads, not from Cloudinary Library, Google Drive, etc.
      // Additional security: Prevent selecting from existing assets
      showCompletedButton: true,
      showUploadMoreButton: true,
    };
    
    logger.log('📋 Cloudinary Widget Configuration:', {
      cloudName: widgetConfig.cloudName,
      uploadPreset: widgetConfig.uploadPreset,
      folder: widgetConfig.folder,
      multiple: widgetConfig.multiple,
      maxFileSize: `${widgetConfig.maxFileSize / 1000000}MB`,
      sources: widgetConfig.sources, // Should be ['local'] only
      group_id: currentGroupId || 'none (individual)',
      category
    });
    
    widgetRef.current = window.cloudinary.createUploadWidget(
      widgetConfig,
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
            // CRITICAL: Check if this is a NEW upload or from Cloudinary Library
            // Use uploaded_at if available (more reliable), otherwise use created_at
            const uploadedAt = result.info.uploaded_at ? new Date(result.info.uploaded_at).getTime() : 0;
            const createdAt = result.info.created_at ? new Date(result.info.created_at).getTime() : 0;
            const now = Date.now();
            
            // File is NEW if:
            // 1. uploaded_at exists and is within last 1 hour (3600 seconds) - very safe
            // 2. OR created_at is within last 1 hour AND uploaded_at doesn't exist
            // 3. OR both don't exist (shouldn't happen, but treat as new)
            const isNewUpload = uploadedAt > 0 
              ? (uploadedAt > now - 3600000) // uploaded_at within last 1 hour
              : (createdAt > 0 ? (createdAt > now - 3600000) : true); // created_at within last 1 hour, or treat as new
            
            // Additional check: uploaded_at should be recent (within 2 minutes of now)
            // This is mostly to distinguish from very old library files
            const isJustUploaded = uploadedAt > 0 && (now - uploadedAt < 120000); // 2 minutes window
            
            // Check if public_id matches the expected folder structure
            const expectedFolder = `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio'}/${category}`;
            const publicIdMatchesFolder = result.info.public_id?.startsWith(expectedFolder);
            
            logger.log(`✅ Cloudinary upload successful - FULL DATA:`, {
              fullResult: result.info,
              fileName: result.info.original_filename,
              publicId: result.info.public_id,
              secureUrl: result.info.secure_url,
              thumbnailUrl: result.info.thumbnail_url,
              group_id: widgetGroupId || 'none (individual)',
              category,
              resourceType: result.info.resource_type,
              bytes: result.info.bytes,
              width: result.info.width,
              height: result.info.height,
              format: result.info.format,
              createdAt: result.info.created_at,
              uploadedAt: result.info.uploaded_at || 'NOT PROVIDED',
              now: new Date(now).toISOString(),
              timeDiff: uploadedAt > 0 ? `${(now - uploadedAt) / 1000}s ago` : 'N/A',
              isNewUpload: isNewUpload,
              isJustUploaded: isJustUploaded,
              publicIdMatchesFolder: publicIdMatchesFolder,
              expectedFolder: expectedFolder,
              warning: (!isNewUpload || !isJustUploaded || !publicIdMatchesFolder) 
                ? '⚠️ This file may be from Cloudinary Library, not a new upload!' 
                : null
            });
            
            // RELAXED CHECK: Only reject if it's very clearly an old file from the library
            // We now use a much wider window (1 hour for isNewUpload and 2 minutes for isJustUploaded)
            if (!isNewUpload || !publicIdMatchesFolder) {
              const reason = !isNewUpload ? "Timestamp is too old" : "Public ID folder mismatch";
              logger.error(`❌ REJECTED: File "${result.info.original_filename}" rejected. Reason: ${reason}`, {
                isNewUpload,
                isJustUploaded,
                publicIdMatchesFolder,
                uploadedAt: result.info.uploaded_at,
                createdAt: result.info.created_at,
                publicId: result.info.public_id,
                expectedFolder
              });
              alert(`❌ Error: The file "${result.info.original_filename}" could not be verified as a new upload.\n\nReason: ${reason}\n\nPlease try again and ensure you are selecting a file from your device.`);
              return; // Skip saving this file
            }
            
            try {
              // Save to Supabase automatically
              const mediaType = result.info.resource_type === 'video' ? 'video' : 'image';
              const fileName = result.info.original_filename || result.info.public_id.split('/').pop();
              
              // Get group_id from widget ref (persisted across callbacks)
              const widgetGroupId = (widgetRef.current as any)?.groupId || currentGroupId;
              
              // Use videoCaption if available for videos, otherwise use fileName
              const videoTitle = category === 'videos' && videoCaption.trim() 
                ? videoCaption.trim() 
                : fileName;
              
              const savePayload = {
                section: category,
                title: videoTitle,
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
              
              // Special handling for 'about' category - save directly to about_content
              let saveResponse;
              if (category === 'about') {
                logger.log(`📝 Saving to About section (profile_image_url) via Widget`);
                saveResponse = await fetch('/api/about', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    profile_image_url: savePayload.media_url,
                  }),
                });
              } else {
                // Regular content items
                saveResponse = await fetch('/api/content', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(savePayload),
                });
              }

              if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
                logger.error('❌ Failed to save to database:', errorData);
                alert(`Upload successful but failed to save to database: ${errorData.error || 'Unknown error'}`);
                return;
              }

              const savedData = await saveResponse.json();
              
              // Notify About component to refresh immediately if this is an About section upload
              if (category === 'about') {
                if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                  const channel = new BroadcastChannel('content-updated');
                  channel.postMessage({ type: 'content-updated', section: 'about' });
                  channel.close();
                  logger.log(`📢 Broadcasted content-updated for About section`);
                }
              }
              logger.log(`✅ Saved to database successfully - FULL DATA:`, {
                fullSavedData: savedData,
                id: savedData?.id,
                title: savedData?.title,
                group_id: savedData?.group_id || 'none',
                media_url: savedData?.media_url,
                cloudinary_public_id: savedData?.cloudinary_public_id,
                created_at: savedData?.created_at,
                section_id: savedData?.section_id
              });
              
              // Verify the saved data matches what we sent
              const mediaUrlMatch = savedData?.media_url === savePayload.media_url;
              const groupIdMatch = savedData?.group_id === widgetGroupId;
              const publicIdMatch = savedData?.cloudinary_public_id === savePayload.cloudinary_public_id;
              
              if (!mediaUrlMatch || !groupIdMatch || !publicIdMatch) {
                logger.error(`⚠️ WARNING: Data mismatch after save!`, {
                  mediaUrlMatch,
                  groupIdMatch,
                  publicIdMatch,
                  expected: {
                    media_url: savePayload.media_url,
                    group_id: widgetGroupId,
                    cloudinary_public_id: savePayload.cloudinary_public_id
                  },
                  actual: {
                    media_url: savedData?.media_url,
                    group_id: savedData?.group_id,
                    cloudinary_public_id: savedData?.cloudinary_public_id
                  },
                  savedId: savedData?.id
                });
              } else {
                logger.log(`✅ All data verified - saved correctly!`);
              }
              
              // Notify other components
              if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                const channel = new BroadcastChannel('content-updated');
                channel.postMessage({ type: 'content-updated', section: category });
                channel.close();
              }

              // Clear video caption after successful upload (only for videos)
              if (category === 'videos') {
                setVideoCaption('');
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
          
          // Log batch completion for debugging
          if (result && result.event === 'batch-cancelled') {
            logger.log('Widget batch cancelled');
          }
          
          if (result && result.event === 'batch-completed') {
            logger.log('Widget batch completed', {
              uploadedCount: result.info?.length || 0,
              category,
              group_id: widgetGroupId || 'none'
            });
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
                    <p className="text-xs text-text-secondary mt-1">
                      💡 Tip: Use a unique group name to avoid mixing with old images. If you use the same name, old images with that name will be shown together with new ones.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-text-primary font-medium">
                      📦 Grouping Instructions:
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside ml-2">
                      <li>All {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : 'uploaded'} files will be grouped together</li>
                      <li>Only the newest image will be displayed in the gallery</li>
                      <li>Click on the grouped image to view all images in the group</li>
                      <li>Each upload gets a UNIQUE group_id (UUID-based) to prevent mixing with old images</li>
                      <li>If you use the same group name, old images with that name will appear together</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Caption Input (only for videos) */}
          {category === 'videos' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Video Caption (سيظهر على الفيديو):
              </label>
              <input
                type="text"
                placeholder="أدخل عنوان الفيديو..."
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-section rounded-lg text-text-primary text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                maxLength={100}
                disabled={uploading}
              />
              <p className="text-xs text-text-secondary">
                هذا العنوان سيظهر على الفيديو من فوق
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category/Section *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Clear video caption when switching away from videos
                if (e.target.value !== 'videos') {
                  setVideoCaption('');
                }
              }}
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

