import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { contentId, type } = body;

    if (!contentId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (type === 'like' || type === 'unlike') {
      if (type === 'like') {
        // Check if already liked
        const { data: existing } = await supabase
          .from('content_likes')
          .select('id')
          .eq('content_item_id', contentId)
          .eq('user_ip', ip)
          .single();

        if (existing) {
          return NextResponse.json({ message: 'Already liked' });
        }

        // Insert like
        const { error } = await supabase
          .from('content_likes')
          .insert({
            content_item_id: contentId,
            user_ip: ip,
            user_agent: userAgent,
          });

        if (error) {
          console.error('Error inserting like:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get updated count
        const { count } = await supabase
          .from('content_likes')
          .select('*', { count: 'exact', head: true })
          .eq('content_item_id', contentId);

        return NextResponse.json({ likes: count || 0 });
      } else {
        // Unlike
        const { error } = await supabase
          .from('content_likes')
          .delete()
          .eq('content_item_id', contentId)
          .eq('user_ip', ip);

        if (error) {
          console.error('Error removing like:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get updated count
        const { count } = await supabase
          .from('content_likes')
          .select('*', { count: 'exact', head: true })
          .eq('content_item_id', contentId);

        return NextResponse.json({ likes: count || 0 });
      }
    }

    if (type === 'view') {
      // Check if already viewed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('content_views')
        .select('id')
        .eq('content_item_id', contentId)
        .eq('user_ip', ip)
        .gte('viewed_at', `${today}T00:00:00Z`)
        .single();

      if (!existing) {
        // Insert view
        await supabase
          .from('content_views')
          .insert({
            content_item_id: contentId,
            user_ip: ip,
          });
      }

      // Get total views
      const { count } = await supabase
        .from('content_views')
        .select('*', { count: 'exact', head: true })
        .eq('content_item_id', contentId);

      return NextResponse.json({ views: count || 0 });
    }

    return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error processing interaction:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get likes, views, and rating for content
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Missing contentId' },
        { status: 400 }
      );
    }

    // Get likes count
    const { count: likesCount } = await supabase
      .from('content_likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_item_id', contentId);

    // Get views count
    const { count: viewsCount } = await supabase
      .from('content_views')
      .select('*', { count: 'exact', head: true })
      .eq('content_item_id', contentId);

    // Get average rating
    const { data: reviews } = await supabase
      .from('content_reviews')
      .select('rating')
      .eq('content_item_id', contentId)
      .eq('is_approved', true);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      likes: likesCount || 0,
      views: viewsCount || 0,
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });
  } catch (error: any) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

