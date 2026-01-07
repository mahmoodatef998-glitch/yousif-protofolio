import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return NextResponse.json(
        { 
          error: 'Cloudinary configuration missing',
          details: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set'
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const fileSizeMB = file.size / 1024 / 1024;
    const maxSizeMB = 4.5; // Vercel's limit
    
    console.log(`Uploading file: ${file.name} (${fileSizeMB.toFixed(2)} MB) to category: ${category}`);

    // Check file size before processing
    if (fileSizeMB > maxSizeMB) {
      return NextResponse.json(
        { 
          error: 'File too large',
          details: `File size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum allowed size (${maxSizeMB} MB). For larger files, please use Cloudinary Upload Widget directly or compress the file first.`,
          fileSize: fileSizeMB,
          maxSize: maxSizeMB,
          suggestion: 'Use Cloudinary Upload Widget for files larger than 4.5MB'
        },
        { status: 413 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 data URL
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'portfolio';
    const publicId = name 
      ? `${folder}/${name.replace(/[^a-zA-Z0-9-_]/g, '-')}`
      : `${folder}/${Date.now()}`;

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: folder,
          public_id: publicId.replace(`${folder}/`, ''),
          resource_type: 'auto', // Supports both images and videos
          tags: [category],
          context: {
            custom: {
              alt: name || file.name.replace(/\.[^/.]+$/, ''),
            },
          },
          overwrite: false,
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    console.log('Upload successful:', uploadResult);
    return NextResponse.json({
      success: true,
      result: uploadResult,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    // Check if it's a size limit error
    if (error.message?.includes('too large') || error.message?.includes('413') || error.message?.includes('Content Too Large')) {
      return NextResponse.json(
        { 
          error: 'File too large',
          details: 'File size exceeds the maximum allowed size (4.5 MB). For larger files, please use Cloudinary Upload Widget directly or compress the file first.',
          suggestion: 'Use Cloudinary Upload Widget for files larger than 4.5MB'
        },
        { status: 413 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload file',
        details: 'Check Cloudinary configuration and file size limits. Maximum file size is 4.5 MB due to Vercel serverless function limits.'
      },
      { status: 500 }
    );
  }
}

