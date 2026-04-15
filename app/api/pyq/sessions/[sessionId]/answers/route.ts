import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const { sessionId } = await params;

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('pyq_test_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: answers, error } = await supabase
      .from('pyq_test_answers')
      .select('*, pyq_questions(*)')
      .eq('session_id', sessionId)
      .order('answered_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ answers: answers || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const { sessionId } = await params;
    const body = await request.json();
    const { question_id, selected_option, is_marked_for_review, time_spent_seconds } = body;

    // Verify session belongs to user and is in_progress
    const { data: session } = await supabase
      .from('pyq_test_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    // Get the correct answer for this question
    let isCorrect: boolean | null = null;
    if (selected_option) {
      const { data: question } = await supabase
        .from('pyq_questions')
        .select('correct_option')
        .eq('id', question_id)
        .single();

      if (question) {
        isCorrect = question.correct_option === selected_option;
      }
    }

    // Upsert answer (update if exists, insert if new)
    const { data: answer, error } = await supabase
      .from('pyq_test_answers')
      .upsert(
        {
          session_id: sessionId,
          question_id,
          selected_option: selected_option || null,
          is_correct: isCorrect,
          is_marked_for_review: is_marked_for_review || false,
          time_spent_seconds: time_spent_seconds || 0,
          answered_at: new Date().toISOString(),
        },
        {
          onConflict: 'session_id,question_id',
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
  }
}
