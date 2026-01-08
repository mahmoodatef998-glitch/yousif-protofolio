import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Approve or reject a review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { reviewId, approve } = body;

    if (!reviewId || typeof approve !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: reviewId and approve' },
        { status: 400 }
      );
    }

    if (approve) {
      // Approve the review
      const { data, error } = await supabase
        .from('content_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error approving review:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Review approved successfully',
        review: data,
      });
    } else {
      // Delete the review (reject)
      const { error } = await supabase
        .from('content_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Review rejected and deleted',
      });
    }
  } catch (error: any) {
    console.error('Error processing review approval:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

