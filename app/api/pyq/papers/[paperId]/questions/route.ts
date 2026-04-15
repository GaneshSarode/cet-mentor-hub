import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    const supabase = getAdminClient();
    const { paperId } = await params;

    const { data, error } = await supabase
      .from('pyq_questions')
      .select('*')
      .eq('paper_id', paperId)
      .order('question_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ questions: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
