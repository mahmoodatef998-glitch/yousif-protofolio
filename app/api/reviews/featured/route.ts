import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get featured reviews (approved, high rating, with comments)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const minRating = parseInt(searchParams.get('minRating') || '4');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get approved reviews with high ratings and comments
    const { data: reviews, error } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('is_approved', true)
      .gte('rating', minRating)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ testimonials: [] });
    }

    // Get content items for these reviews
    const contentItemIds = [...new Set(reviews.map((r: any) => r.content_item_id))];
    const { data: contentItems } = await supabase
      .from('content_items')
      .select('id, section_id, title')
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

    // Transform data to match Testimonial interface
    const testimonials = reviews.map((review: any) => {
      const contentItem = contentItemMap.get(review.content_item_id);
      const section = contentItem ? sectionMap.get(contentItem.section_id) : null;
      
      return {
        id: review.id,
        name: review.user_name || 'Anonymous',
        role: section?.title || 'Client',
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name || 'Anonymous')}&background=random&size=150`,
        text: review.comment,
        rating: review.rating,
        project: section?.title || null,
        createdAt: review.created_at,
      };
    });

    return NextResponse.json({ testimonials });
  } catch (error: any) {
    console.error('Error fetching featured reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

