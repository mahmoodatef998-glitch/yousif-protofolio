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
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError.message || 'Failed to parse request body'
        },
        { status: 400 }
      );
    }

    // Validate required fields (at least one field should be present)
    if (!body || (typeof body !== 'object')) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: 'Request body must be a valid JSON object'
        },
        { status: 400 }
      );
    }

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

    // Prepare data for insert/update (ensure stats is valid JSON)
    let statsValue = null;
    if (body.stats) {
      if (typeof body.stats === 'object' && !Array.isArray(body.stats)) {
        // Valid object, use as is
        statsValue = body.stats;
      } else if (typeof body.stats === 'string') {
        // Try to parse if it's a string
        try {
          statsValue = JSON.parse(body.stats);
        } catch (e) {
          console.warn('Failed to parse stats string:', e);
          statsValue = null;
        }
      }
    }

    const dataToSave: any = {};
    
    // Only include fields that are present in the body
    if (body.hero_title !== undefined) dataToSave.hero_title = body.hero_title;
    if (body.hero_subtitle !== undefined) dataToSave.hero_subtitle = body.hero_subtitle;
    if (body.bio_text !== undefined) dataToSave.bio_text = body.bio_text;
    if (body.profile_image_url !== undefined) dataToSave.profile_image_url = body.profile_image_url;
    if (statsValue !== undefined) dataToSave.stats = statsValue;

    console.log('Saving about content:', {
      existing: !!existing,
      hasStats: !!dataToSave.stats,
      fields: Object.keys(dataToSave),
    });

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('about_content')
        .update(dataToSave)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating about content:', error);
        
        // Check if it's a schema error (missing column)
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache')) {
          return NextResponse.json(
            { 
              error: error.message,
              code: error.code,
              details: 'Database schema mismatch. The about_content table is missing required columns. Please run the SQL script: supabase/fix_about_content_schema.sql in your Supabase SQL Editor to fix the schema.',
              fixRequired: true,
              sqlScript: 'supabase/fix_about_content_schema.sql'
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code,
            details: 'Failed to update about content in Supabase. Check your database schema and RLS policies.'
          },
          { status: 500 }
        );
      }

      console.log('About content updated successfully:', data?.id);
      return NextResponse.json({ data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from('about_content')
        .insert([dataToSave])
        .select()
        .single();

      if (error) {
        console.error('Error inserting about content:', error);
        
        // Check if it's a schema error (missing column)
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache')) {
          return NextResponse.json(
            { 
              error: error.message,
              code: error.code,
              details: 'Database schema mismatch. The about_content table is missing required columns. Please run the SQL script: supabase/fix_about_content_schema.sql in your Supabase SQL Editor to fix the schema.',
              fixRequired: true,
              sqlScript: 'supabase/fix_about_content_schema.sql'
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            error: error.message,
            code: error.code,
            details: 'Failed to insert about content into Supabase. Check your database schema and RLS policies.'
          },
          { status: 500 }
        );
      }

      console.log('About content inserted successfully:', data?.id);
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

