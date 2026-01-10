import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limit';
import { contentItemSchema, validateRequest } from '@/lib/validations';

// GET - Fetch all content
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await apiRateLimiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Missing Supabase environment variables');
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
        logger.error(`Section '${section}' not found:`, sectionError);
        return NextResponse.json({ 
          data: [],
          message: `Section '${section}' not found. Make sure you ran the schema.sql and seed.sql files in Supabase.`,
          error: sectionError.message 
        });
      }
      
      if (sectionData) {
        query = query.eq('section_id', sectionData.id);
      } else {
        logger.warn(`Section '${section}' not found in database`);
        return NextResponse.json({ 
          data: [],
          message: `Section '${section}' not found in database. Make sure you ran the schema.sql and seed.sql files in Supabase.`
        });
      }
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to fetch content from Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    logger.log(`Fetched ${data?.length || 0} items for section '${section || 'all'}'`);
    
    // Log details for debugging
    if (data && data.length > 0) {
      logger.debug('Sample item:', {
        id: data[0].id,
        title: data[0].title,
        media_url: data[0].media_url,
        is_active: data[0].is_active,
        section_id: data[0].section_id,
        group_id: data[0].group_id,
      });
      
      // Log all items with group_id for debugging
      const itemsWithGroup = data.filter((item: any) => item.group_id);
      const itemsWithoutGroup = data.filter((item: any) => !item.group_id);
      
      logger.debug(`Items with group_id: ${itemsWithGroup.length}, without: ${itemsWithoutGroup.length}`);
      
      if (itemsWithGroup.length > 0) {
        // Group by group_id to see what groups exist
        const groupMap = new Map<string, any[]>();
        itemsWithGroup.forEach((item: any) => {
          const gid = String(item.group_id);
          if (!groupMap.has(gid)) {
            groupMap.set(gid, []);
          }
          groupMap.get(gid)!.push(item);
        });
        
        logger.debug('Groups found in API:', Array.from(groupMap.entries()).map(([groupId, items]) => ({
          group_id: groupId,
          count: items.length,
          items: items.map((i: any) => ({ id: i.id, title: i.title, created_at: i.created_at }))
        })));
      }
      
      // Log all items with media_url status
      const itemsWithUrl = data.filter((item: any) => item.media_url && item.media_url.trim() !== '');
      const itemsWithoutUrl = data.filter((item: any) => !item.media_url || item.media_url.trim() === '');
      
      logger.debug(`Items with media_url: ${itemsWithUrl.length}, without: ${itemsWithoutUrl.length}`);
      
      if (itemsWithoutUrl.length > 0) {
        logger.warn('Items without media_url:', itemsWithoutUrl.map((item: any) => ({
          id: item.id,
          title: item.title,
          media_type: item.media_type,
        })));
      }
    } else {
      logger.warn(`No data returned for section '${section || 'all'}'`);
    }
    
    return NextResponse.json({ 
      data: data || [],
      count: data?.length || 0,
      section: section || 'all',
    });
  } catch (error: any) {
    logger.error('API route error:', error);
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
    // Rate limiting
    const rateLimitResult = await apiRateLimiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Missing Supabase environment variables');
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

    logger.log(`Creating content for section: ${body.section}`);

    // Get section ID
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('id')
      .eq('name', body.section)
      .single();

    if (sectionError || !sectionData) {
      logger.error(`Section '${body.section}' not found:`, sectionError);
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
      logger.error('Error getting max order_index:', maxOrderError);
    }

    // Build content object, only include group_id if it exists in the request
    logger.log(`📝 Creating content item`, {
      section: body.section,
      title: body.title,
      media_type: body.media_type,
      media_url: body.media_url?.substring(0, 50) + '...',
      group_id: body.group_id || 'none (individual)',
      cloudinary_public_id: body.cloudinary_public_id
    });
    
    const newContent: any = {
      section_id: sectionData.id,
      title: body.title || '',
      description: body.description || '',
      media_type: body.media_type || 'image',
      media_url: body.media_url || '',
      thumbnail_url: body.thumbnail_url || body.media_url || '',
      cloudinary_public_id: body.cloudinary_public_id || '',
      order_index: (maxOrder?.order_index ?? 0) + 1,
      metadata: body.metadata || {},
      is_active: true, // ✅ إضافة is_active صراحة
    };

    // Only add group_id if it's provided (and column exists in database)
    if (body.group_id) {
      newContent.group_id = body.group_id;
      logger.log(`📦 Adding group_id to content: ${body.group_id}`);
    } else {
      logger.log(`📦 No group_id provided - content will be individual`);
    }

    logger.log('💾 Inserting content into database:', {
      section: body.section,
      section_id: sectionData.id,
      title: newContent.title,
      media_type: newContent.media_type,
      media_url: newContent.media_url?.substring(0, 50) + '...',
      group_id: newContent.group_id || 'none (individual)',
      is_active: newContent.is_active,
      order_index: newContent.order_index,
    });

    const { data, error } = await supabase
      .from('content_items')
      .insert([newContent])
      .select()
      .single();

    if (error) {
      logger.error('Error inserting content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to insert content into Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    logger.log('✅ Content created successfully', {
      id: data.id,
      title: data.title,
      group_id: data.group_id || 'none',
      media_url: data.media_url?.substring(0, 50) + '...',
      created_at: data.created_at
    });
    
    // Verify group_id was saved correctly
    if (body.group_id && data.group_id !== body.group_id) {
      logger.error(`⚠️ WARNING: group_id mismatch after save!`, {
        expected: body.group_id,
        actual: data.group_id,
        savedId: data.id
      });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    logger.error('API route error:', error);
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

    logger.log(`Deleting content with ID: ${id}`);

    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to delete content from Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    logger.log('Content deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('API route error:', error);
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

    logger.debug(`Updating content with ID: ${id}`, updates);

    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating content:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: 'Failed to update content in Supabase. Check your database connection and RLS policies.'
        },
        { status: 500 }
      );
    }

    logger.log('Content updated successfully:', data.id);
    return NextResponse.json({ data });
  } catch (error: any) {
    logger.error('API route error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: 'An unexpected error occurred while processing the request'
      },
      { status: 500 }
    );
  }
}

