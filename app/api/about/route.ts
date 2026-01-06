import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch about content
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST/PATCH - Save about content
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Check if exists
    const { data: existing } = await supabase
      .from('about_content')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('about_content')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

