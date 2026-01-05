'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryUploadWidgetProps {
  folder?: string;
  onUpload?: (result: any) => void;
}

export function CloudinaryUploadWidget({ folder = 'portfolio', onUpload }: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="upload-widget.cloudinary.com"]')) {
      setScriptLoaded(true);
      return;
    }

    // Load Cloudinary widget script
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setScriptLoaded(true);
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleUpload = () => {
    if (!window.cloudinary || !scriptLoaded) {
      alert('Upload widget is loading, please try again in a moment');
      return;
    }

    setLoading(true);

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || undefined,
          folder: folder,
          multiple: true,
          resourceType: 'auto',
          maxFileSize: 100000000, // 100MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'],
          cropping: false,
          showAdvancedOptions: true,
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1',
            },
          },
        },
        (error: any, result: any) => {
          setLoading(false);
          
          if (error) {
            console.error('Upload error:', error);
            alert('Upload error: ' + (error.message || 'Unknown error'));
            return;
          }

          if (result && result.event === 'success') {
            console.log('Upload successful:', result.info);
            if (onUpload) {
              onUpload(result.info);
            }
          }

          if (result && result.event === 'close') {
            setLoading(false);
          }
        }
      );
    }
    
    widgetRef.current.open();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleUpload}
      disabled={loading || !scriptLoaded}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <Upload className="w-5 h-5" />
          Upload Images/Videos
        </>
      )}
    </button>
  );
}

