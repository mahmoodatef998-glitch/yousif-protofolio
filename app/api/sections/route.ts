import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch section data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    let query = supabase
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (name) {
      query = query.eq('name', name);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update section
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, ...updates } = body;

    if (!name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sections')
      .update(updates)
      .eq('name', name)
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

