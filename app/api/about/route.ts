import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { apiRateLimiter } from '@/lib/rate-limit';
import { aboutContentSchema, validateRequest } from '@/lib/validations';

// GET - Fetch about content
export async function GET(request: NextRequest) {
  try {
    // No rate limiting for GET requests (read-only, safe)

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
      
      logger.error('Error fetching about content:', error);
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

// POST/PATCH - Save about content
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
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      logger.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError.message || 'Failed to parse request body'
        },
        { status: 400 }
      );
    }

    // Validate request body using Zod schema
    // Use partial() to make all fields optional for partial updates
    const validation = validateRequest(aboutContentSchema.partial(), body);
    if (!validation.success) {
      logger.error('Validation failed:', {
        body,
        error: validation.error
      });
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error || 'Invalid input: expected string, received undefined'
        },
        { status: 400 }
      );
    }

    const validatedBody = validation.data;

    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from('about_content')
      .select('id')
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Error checking existing about content:', checkError);
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
          logger.warn('Failed to parse stats string:', e);
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

    logger.debug('Saving about content:', {
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
        logger.error('Error updating about content:', error);
        
        // Check if it's a schema error (missing column)
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache')) {
          return NextResponse.json(
            { 
              error: error.message,
              code: error.code,
              details: 'Database schema mismatch. The about_content table is missing required columns or schema cache needs refresh. Try: 1) Run supabase/recreate_about_content_table.sql in Supabase SQL Editor (⚠️ will delete existing data), 2) Wait 30-60 seconds, 3) Try again. If problem persists, restart your Supabase project to refresh schema cache.',
              fixRequired: true,
              sqlScript: 'supabase/recreate_about_content_table.sql',
              alternativeScript: 'supabase/fix_about_content_schema.sql',
              instructions: 'See FIX_ABOUT_SCHEMA_CACHE.md for detailed steps'
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

      logger.log('About content updated successfully:', data?.id);
      return NextResponse.json({ data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from('about_content')
        .insert([dataToSave])
        .select()
        .single();

      if (error) {
        logger.error('Error inserting about content:', error);
        
        // Check if it's a schema error (missing column)
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache')) {
          return NextResponse.json(
            { 
              error: error.message,
              code: error.code,
              details: 'Database schema mismatch. The about_content table is missing required columns or schema cache needs refresh. Try: 1) Run supabase/recreate_about_content_table.sql in Supabase SQL Editor (⚠️ will delete existing data), 2) Wait 30-60 seconds, 3) Try again. If problem persists, restart your Supabase project to refresh schema cache.',
              fixRequired: true,
              sqlScript: 'supabase/recreate_about_content_table.sql',
              alternativeScript: 'supabase/fix_about_content_schema.sql',
              instructions: 'See FIX_ABOUT_SCHEMA_CACHE.md for detailed steps'
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

      logger.log('About content inserted successfully:', data?.id);
      return NextResponse.json({ data });
    }
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

