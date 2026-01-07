import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch about content
export async function GET() {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          error: 'Supabase configuration missing',
          details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = no rows returned (this is OK, return null)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null });
      }
      
      console.error('Error fetching about content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to fetch about content from Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: 'An unexpected error occurred while processing the request'
      },
      { status: 500 }
    );
  }
}

// POST/PATCH - Save about content
export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { 
          error: 'Supabase configuration missing',
          details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from('about_content')
      .select('id')
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing about content:', checkError);
      return NextResponse.json(
        { 
          error: checkError.message,
          code: checkError.code,
          details: 'Failed to check existing about content'
        },
        { status: 500 }
      );
    }

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('about_content')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating about content:', error);
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code,
            details: 'Failed to update about content in Supabase'
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from('about_content')
        .insert([body])
        .select()
        .single();

      if (error) {
        console.error('Error inserting about content:', error);
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code,
            details: 'Failed to insert about content into Supabase'
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ data });
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: 'An unexpected error occurred while processing the request'
      },
      { status: 500 }
    );
  }
}

