import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Debug endpoint to check everything
// ⚠️ WARNING: This endpoint should be disabled in production for security
export async function GET(request: NextRequest) {
  // Disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint is disabled in production' },
      { status: 403 }
    );
  }
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  };

  // Check 1: Environment Variables
  results.checks.env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'MISSING',
  };

  if (!results.checks.env.hasUrl || !results.checks.env.hasKey) {
    results.errors.push('Missing Supabase environment variables');
    return NextResponse.json(results, { status: 500 });
  }

  try {
    // Check 2: Supabase Connection
    const supabase = await createClient();
    
    // Check 3: Sections Table
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id, name, is_active')
      .limit(10);

    results.checks.sections = {
      exists: !sectionsError,
      count: sections?.length || 0,
      error: sectionsError?.message,
      data: sections,
    };

    // Check 4: Content Items Table
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('id, title, media_url, is_active, section_id')
      .limit(10);

    results.checks.contentItems = {
      exists: !contentError,
      count: contentItems?.length || 0,
      error: contentError?.message,
      activeCount: contentItems?.filter(item => item.is_active === true).length || 0,
      sample: contentItems?.slice(0, 3),
    };

    // Check 5: Specific Section (product)
    const { data: productSection, error: productSectionError } = await supabase
      .from('sections')
      .select('id, name')
      .eq('name', 'product')
      .single();

    if (productSection) {
      const { data: productContent, error: productContentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('section_id', productSection.id)
        .eq('is_active', true)
        .limit(5);

      results.checks.productSection = {
        found: true,
        sectionId: productSection.id,
        contentCount: productContent?.length || 0,
        error: productContentError?.message,
        content: productContent,
      };
    } else {
      results.checks.productSection = {
        found: false,
        error: productSectionError?.message,
      };
    }

    // Check 6: RLS Policies (try to read as anonymous)
    const { data: publicReadTest, error: publicReadError } = await supabase
      .from('content_items')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    results.checks.rlsPublicRead = {
      works: !publicReadError,
      error: publicReadError?.message,
      code: publicReadError?.code,
    };

  } catch (error: any) {
    results.errors.push(error.message);
    results.stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
  }

  return NextResponse.json(results, { 
    status: results.errors.length > 0 ? 500 : 200 
  });
}

