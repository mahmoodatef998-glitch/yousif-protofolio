import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { reviewRateLimiter } from '@/lib/rate-limit';
import { contentReviewSchema, validateRequest } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await reviewRateLimiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validate request body using Zod schema
    const validation = validateRequest(contentReviewSchema, {
      content_item_id: body.contentId,
      rating: body.rating,
      comment: body.comment,
      user_name: body.name,
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error
        },
        { status: 400 }
      );
    }

    const { content_item_id, rating, comment, user_name } = validation.data;

    // Get user IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Insert review (needs approval)
    // Note: Using RLS policies, so we need to ensure the policy allows public inserts
    const { data, error } = await supabase
      .from('content_reviews')
      .insert({
        content_item_id,
        rating,
        comment: comment || null,
        user_name: user_name || null,
        user_ip: ip,
        is_approved: false, // Requires admin approval
      })
      .select()
      .single();

    if (error) {
      logger.error('Error inserting review:', error);
      logger.error('Error details:', JSON.stringify(error, null, 2));
      logger.error('Error code:', error.code);
      logger.error('Error message:', error.message);
      
      // Check if it's an RLS policy error
      if (error.message?.includes('row-level security') || 
          error.message?.includes('violates row-level security') ||
          error.code === '42501' || 
          error.code === 'PGRST301') {
        return NextResponse.json(
          { 
            error: 'Permission denied. RLS policy is blocking the insert.',
            details: 'The review could not be submitted due to security policy restrictions. Please run the fix_reviews_insert_final.sql script in Supabase SQL Editor.',
            code: error.code,
            hint: 'Make sure the policy "Allow public insert to content_reviews" exists and has TO public'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json({ 
        error: error.message || 'Failed to submit review',
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be reviewed before being published.',
      data,
    });
  } catch (error: any) {
    logger.error('Error processing review:', error);
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
      logger.error('Error fetching reviews:', error);
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

