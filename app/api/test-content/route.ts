import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Test endpoint to check content data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'product';

    const supabase = await createClient();

    // Get section
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('id, name, is_active')
      .eq('name', section)
      .single();

    if (sectionError || !sectionData) {
      return NextResponse.json({
        error: 'Section not found',
        sectionError: sectionError?.message,
        section,
      }, { status: 404 });
    }

    // Get content items
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .eq('section_id', sectionData.id)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (contentError) {
      return NextResponse.json({
        error: 'Failed to fetch content',
        contentError: contentError.message,
        code: contentError.code,
        section,
        sectionId: sectionData.id,
      }, { status: 500 });
    }

    // Format response
    const formatted = contentItems?.map(item => ({
      id: item.id,
      title: item.title,
      media_type: item.media_type,
      media_url: item.media_url,
      thumbnail_url: item.thumbnail_url,
      is_active: item.is_active,
      has_media_url: !!(item.media_url && item.media_url.trim() !== ''),
      media_url_length: item.media_url?.length || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      section: {
        id: sectionData.id,
        name: sectionData.name,
        is_active: sectionData.is_active,
      },
      content: {
        total: contentItems?.length || 0,
        items: formatted,
        items_with_url: formatted.filter(item => item.has_media_url).length,
        items_without_url: formatted.filter(item => !item.has_media_url).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

