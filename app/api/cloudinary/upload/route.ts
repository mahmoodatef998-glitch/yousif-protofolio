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

    console.log(`Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) to category: ${category}`);

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
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload file',
        details: 'Check Cloudinary configuration and file size limits'
      },
      { status: 500 }
    );
  }
}

