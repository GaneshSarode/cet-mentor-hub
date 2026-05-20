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

    // Sort papers chronologically:
    // 1. Year descending (2025 papers first, then 2024)
    // 2. Exam date ascending (e.g. April 19th before April 26th)
    // 3. Shift (morning before evening)
    const sortedData = data ? [...data].sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }

      const dateA = a.exam_date || "";
      const dateB = b.exam_date || "";
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      if (a.shift === "morning" && b.shift === "evening") return -1;
      if (a.shift === "evening" && b.shift === "morning") return 1;

      return 0;
    }) : [];

    return NextResponse.json({ papers: sortedData });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch papers' }, { status: 500 });
  }
}
