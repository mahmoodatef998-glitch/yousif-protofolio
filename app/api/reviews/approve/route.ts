import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Approve, unapprove, or reject a review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { reviewId, approve, isApproved } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing required field: reviewId' },
        { status: 400 }
      );
    }

    // Handle approve/unapprove (isApproved can be true or false)
    if (typeof isApproved === 'boolean') {
      const { data, error } = await supabase
        .from('content_reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        console.error('Error updating review approval status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: isApproved ? 'Review approved successfully' : 'Review unapproved successfully',
        review: data,
      });
    }

    // Legacy support: approve boolean
    if (typeof approve === 'boolean') {
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
    }

    return NextResponse.json(
      { error: 'Missing required field: approve or isApproved' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing review approval:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review permanently
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing required field: reviewId' },
        { status: 400 }
      );
    }

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
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

