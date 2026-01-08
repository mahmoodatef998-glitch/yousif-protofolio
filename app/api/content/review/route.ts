import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { contentId, rating, comment, name } = body;

    if (!contentId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get user IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Insert review (needs approval)
    // Note: Using RLS policies, so we need to ensure the policy allows public inserts
    const { data, error } = await supabase
      .from('content_reviews')
      .insert({
        content_item_id: contentId,
        rating,
        comment: comment || null,
        user_name: name || null,
        user_ip: ip,
        is_approved: false, // Requires admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting review:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's an RLS policy error
      if (error.message?.includes('row-level security') || error.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Permission denied. Please check RLS policies.',
            details: 'The review could not be submitted due to security policy restrictions. Please run the fix_reviews_rls.sql script in Supabase.',
            code: error.code
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be reviewed before being published.',
      data,
    });
  } catch (error: any) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get reviews for content
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

    const { data, error } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('content_item_id', contentId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

