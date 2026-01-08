import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get pending reviews (not approved yet)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get pending reviews
    const { data: reviews, error } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ reviews: [] });
    }

    // Get content items for these reviews
    const contentItemIds = [...new Set(reviews.map((r: any) => r.content_item_id))];
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('id, section_id, title, media_type, media_url')
      .in('id', contentItemIds);

    // Get sections
    const sectionIds = [...new Set((contentItems || []).map((ci: any) => ci.section_id).filter(Boolean))];
    const { data: sections } = await supabase
      .from('sections')
      .select('id, name, title')
      .in('id', sectionIds);

    // Create maps for quick lookup
    const contentItemMap = new Map((contentItems || []).map((ci: any) => [ci.id, ci]));
    const sectionMap = new Map((sections || []).map((s: any) => [s.id, s]));

    // Combine data
    const reviewsWithContent = reviews.map((review: any) => {
      const contentItem = contentItemMap.get(review.content_item_id);
      const section = contentItem ? sectionMap.get(contentItem.section_id) : null;
      
      return {
        ...review,
        content_items: contentItem ? {
          ...contentItem,
          sections: section
        } : null
      };
    });

    return NextResponse.json({ reviews: reviewsWithContent });
  } catch (error: any) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

