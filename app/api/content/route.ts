import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all content
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    let query = supabase
      .from('content_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (section) {
      const sectionQuery = supabase
        .from('sections')
        .select('id')
        .eq('name', section)
        .single();

      const { data: sectionData, error: sectionError } = await sectionQuery;
      
      if (sectionError) {
        console.error(`Section '${section}' not found:`, sectionError);
        return NextResponse.json({ 
          data: [],
          message: `Section '${section}' not found. Make sure you ran the schema.sql and seed.sql files in Supabase.`,
          error: sectionError.message 
        });
      }
      
      if (sectionData) {
        query = query.eq('section_id', sectionData.id);
      } else {
        console.log(`Section '${section}' not found in database`);
        return NextResponse.json({ 
          data: [],
          message: `Section '${section}' not found in database. Make sure you ran the schema.sql and seed.sql files in Supabase.`
        });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to fetch content from Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    console.log(`Fetched ${data?.length || 0} items for section '${section || 'all'}'`);
    return NextResponse.json({ data: data || [] });
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

// POST - Create new content
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get section ID
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('name', body.section)
      .single();

    if (sectionError || !sectionData) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from('content_items')
      .select('order_index')
      .eq('section_id', sectionData.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const newContent = {
      section_id: sectionData.id,
      title: body.title || '',
      description: body.description || '',
      media_type: body.media_type || 'image',
      media_url: body.media_url || '',
      thumbnail_url: body.thumbnail_url || '',
      cloudinary_public_id: body.cloudinary_public_id || '',
      order_index: (maxOrder?.order_index || 0) + 1,
      metadata: body.metadata || {},
    };

    const { data, error } = await supabase
      .from('content_items')
      .insert([newContent])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update content
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

