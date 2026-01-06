import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch contact info
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST/PATCH - Save contact info
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Check if exists
    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('contact_info')
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
        .from('contact_info')
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

