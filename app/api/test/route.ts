import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple test endpoint to check Supabase connection
export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        details: {
          hasUrl,
          hasKey,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        }
      }, { status: 500 });
    }

    // Try to create Supabase client
    const supabase = await createClient();
    
    // Try a simple query
    const { data, error } = await supabase
      .from('sections')
      .select('id, name')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: error.message,
        code: error.code,
        hint: error.hint,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      data: {
        sectionsFound: data?.length || 0,
        sampleSection: data?.[0] || null,
      },
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

