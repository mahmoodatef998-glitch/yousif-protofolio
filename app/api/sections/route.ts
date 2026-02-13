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
      console.error('❌ DELETE Section: Missing name parameter');
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    console.log(`🗑️ DELETE Section Request: name=${name}`);

    // First, find the section to get its UUID
    const { data: sectionData, error: findError } = await supabase
      .from('sections')
      .select('id, name')
      .eq('name', name)
      .single();

    if (findError) {
      console.error(`❌ DELETE Section: Failed to find section "${name}":`, findError);
      return NextResponse.json({ error: `Section "${name}" not found` }, { status: 404 });
    }

    const sectionId = sectionData.id;
    console.log(`✅ DELETE Section: Found section "${name}" with ID: ${sectionId}`);

    // Delete content items first (even though schema has ON DELETE CASCADE, let's be explicit and safe)
    const { error: contentDeleteError } = await supabase
      .from('content_items')
      .delete()
      .eq('section_id', sectionId);

    if (contentDeleteError) {
      console.warn(`⚠️ DELETE Section: Failed to delete content items for "${name}":`, contentDeleteError);
      // Continue anyway, as the main section delete might still work
    } else {
      console.log(`✅ DELETE Section: Successfully deleted content items for "${name}"`);
    }

    // Now delete the section
    const { error: deleteError, count } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId);

    if (deleteError) {
      console.error(`❌ DELETE Section: Failed to delete section row:`, deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log(`✅ DELETE Section: Successfully deleted section "${name}" from database`);

    return NextResponse.json({ success: true, deleted: name });
  } catch (error: any) {
    console.error(`❌ DELETE Section: Unexpected error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

