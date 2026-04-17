import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    // In a real app, verify userId is an admin
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paperId, questions } = body;

    if (!paperId || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Map CSV rows to database schema
    const rowsToInsert = questions.map((q: any) => ({
      paper_id: paperId,
      question_number: parseInt(q.question_number),
      subject: q.subject,
      topic: q.topic || null,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option?.toUpperCase(), // Ensure A,B,C,D
      solution_text: q.solution_text || null,
      difficulty: q.difficulty || 'medium',
      marks_positive: q.subject.toLowerCase() === 'mathematics' ? 2 : 1,
      marks_negative: 0
    }));

    const { data, error } = await supabase
      .from('pyq_questions')
      .upsert(rowsToInsert, { onConflict: 'paper_id,question_number' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inserted: rowsToInsert.length });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to bulk insert questions' }, { status: 500 });
  }
}
