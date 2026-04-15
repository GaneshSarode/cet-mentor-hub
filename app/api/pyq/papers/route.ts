import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const year = searchParams.get('year');
    const shift = searchParams.get('shift');
    const subjectGroup = searchParams.get('subject_group');

    let query = supabase
      .from('pyq_papers')
      .select('*')
      .eq('is_active', true)
      .order('year', { ascending: false })
      .order('shift', { ascending: true });

    if (year) query = query.eq('year', parseInt(year));
    if (shift) query = query.eq('shift', shift);
    if (subjectGroup) query = query.eq('subject_group', subjectGroup);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ papers: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 });
  }
}
