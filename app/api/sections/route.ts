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

// POST - Create new section
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('sections')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newSection = {
      name: name.toLowerCase(),
      title: name,
      description: description || `Manage ${name} gallery`,
      type: 'gallery', // Required by schema
      is_active: true,
      display_order: (maxOrder?.display_order || 0) + 1
    };

    const { data, error } = await supabase
      .from('sections')
      .insert([newSection])
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

// DELETE - Delete section
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('name', name);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

