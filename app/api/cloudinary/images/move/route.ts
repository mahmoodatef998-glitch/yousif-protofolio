import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Move image to different category (update tags)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_id, from_category, to_category } = body;

    if (!public_id || !to_category) {
      return NextResponse.json(
        { error: 'public_id and to_category are required' },
        { status: 400 }
      );
    }

    // Get current image info
    const image = await cloudinary.api.resource(public_id);
    const currentTags = image.tags || [];

    // Remove old category tag if it exists
    if (from_category && currentTags.includes(from_category)) {
      await cloudinary.uploader.remove_tag(from_category, [public_id]);
    }

    // Add new category tag (as first tag)
    await cloudinary.uploader.add_tag(to_category, [public_id]);

    const result = await cloudinary.api.resource(public_id);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error moving image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to move image' },
      { status: 500 }
    );
  }
}

