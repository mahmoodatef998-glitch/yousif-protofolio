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
    
    // Log details for debugging
    if (data && data.length > 0) {
      console.log('Sample item:', {
        id: data[0].id,
        title: data[0].title,
        media_url: data[0].media_url,
        is_active: data[0].is_active,
        section_id: data[0].section_id,
      });
      
      // Log all items with media_url status
      const itemsWithUrl = data.filter((item: any) => item.media_url && item.media_url.trim() !== '');
      const itemsWithoutUrl = data.filter((item: any) => !item.media_url || item.media_url.trim() === '');
      
      console.log(`Items with media_url: ${itemsWithUrl.length}, without: ${itemsWithoutUrl.length}`);
      
      if (itemsWithoutUrl.length > 0) {
        console.warn('Items without media_url:', itemsWithoutUrl.map((item: any) => ({
          id: item.id,
          title: item.title,
          media_type: item.media_type,
        })));
      }
    } else {
      console.warn(`No data returned for section '${section || 'all'}'`);
    }
    
    return NextResponse.json({ 
      data: data || [],
      count: data?.length || 0,
      section: section || 'all',
    });
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

    // Validate required fields
    if (!body.section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    if (!body.media_url) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 });
    }

    console.log(`Creating content for section: ${body.section}`);

    // Get section ID
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('name', body.section)
      .single();

    if (sectionError || !sectionData) {
      console.error(`Section '${body.section}' not found:`, sectionError);
      return NextResponse.json(
        { 
          error: 'Section not found',
          details: `Section '${body.section}' does not exist. Make sure you ran the schema.sql and seed.sql files in Supabase.`
        },
        { status: 404 }
      );
    }

    // Get max order_index
    const { data: maxOrder, error: maxOrderError } = await supabase
      .from('content_items')
      .select('order_index')
      .eq('section_id', sectionData.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
      console.error('Error getting max order_index:', maxOrderError);
    }

    const newContent = {
      section_id: sectionData.id,
      title: body.title || '',
      description: body.description || '',
      media_type: body.media_type || 'image',
      media_url: body.media_url || '',
      thumbnail_url: body.thumbnail_url || body.media_url || '',
      cloudinary_public_id: body.cloudinary_public_id || '',
      group_id: body.group_id || null, // Optional group identifier
      order_index: (maxOrder?.order_index ?? 0) + 1,
      metadata: body.metadata || {},
      is_active: true, // ✅ إضافة is_active صراحة
    };

    console.log('Inserting content:', {
      section: body.section,
      section_id: sectionData.id,
      title: newContent.title,
      media_type: newContent.media_type,
      is_active: newContent.is_active,
    });

    const { data, error } = await supabase
      .from('content_items')
      .insert([newContent])
      .select()
      .single();

    if (error) {
      console.error('Error inserting content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to insert content into Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    console.log('Content created successfully:', data);
    return NextResponse.json({ data });
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

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log(`Deleting content with ID: ${id}`);

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to delete content from Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    console.log('Content deleted successfully');
    return NextResponse.json({ success: true });
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

// PATCH - Update content
export async function PATCH(request: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log(`Updating content with ID: ${id}`, updates);

    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to update content in Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    console.log('Content updated successfully:', data);
    return NextResponse.json({ data });
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

