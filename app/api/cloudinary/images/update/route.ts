import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PATCH - Update image metadata (tags, context)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_id, tags, context, category } = body;

    if (!public_id) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      );
    }

    const updates: any = {};

    // Update tags (if category changed, update first tag)
    if (category) {
      const currentTags = tags || [];
      const newTags = currentTags.filter((t: string) => t !== currentTags[0]);
      newTags.unshift(category);
      updates.tags = newTags.join(',');
    } else if (tags) {
      updates.tags = Array.isArray(tags) ? tags.join(',') : tags;
    }

    // Update context
    if (context) {
      updates.context = context;
    }

    // Cloudinary doesn't have a single update method, we need to use add_context and add_tag separately
    let result: any = {};

    if (updates.tags) {
      // Replace all tags
      const existingResource = await cloudinary.api.resource(public_id);
      const existingTags = existingResource.tags || [];
      
      // Remove all existing tags first
      for (const tag of existingTags) {
        await cloudinary.uploader.remove_tag(tag, [public_id]);
      }
      
      // Add new tags
      const newTags = updates.tags.split(',');
      for (const tag of newTags) {
        if (tag.trim()) {
          await cloudinary.uploader.add_tag(tag.trim(), [public_id]);
        }
      }
      result.tags = newTags;
    }

    if (updates.context) {
      result = await cloudinary.uploader.add_context(updates.context, [public_id]);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update image' },
      { status: 500 }
    );
  }
}

