import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { percentile, category, dataset } = body;

    // Validate inputs
    if (typeof percentile !== 'number' || percentile < 0 || percentile > 100) {
      return NextResponse.json({ error: 'Invalid percentile' }, { status: 400 });
    }
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (!dataset || !['cap3_24', 'cap1_25'].includes(dataset)) {
      return NextResponse.json({ error: 'Invalid dataset' }, { status: 400 });
    }

    const academicYear = dataset === 'cap3_24' ? '24-25' : '25-26';
    const capRound = dataset === 'cap3_24' ? 3 : 1;

    const supabase = getAdminClient();

    // Query cutoffs table with joins to branches and colleges
    const { data, error: dbError } = await supabase
      .from('cutoffs')
      .select(
        `
        percentile,
        category,
        merit_no,
        cap_round,
        branch:branches!inner(
          name,
          college:colleges!inner(
            name
          )
        )
      `
      )
      .eq('category', category)
      .eq('cap_round', capRound)
      .eq('academic_year', academicYear)
      .gte('percentile', percentile - 15)
      .lte('percentile', percentile + 5)
      .order('percentile', { ascending: false })
      .limit(1500);

    if (dbError) {
      console.error('Supabase prediction query error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ cutoffs: data || [] });
  } catch (err: unknown) {
    console.error('Prediction API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
