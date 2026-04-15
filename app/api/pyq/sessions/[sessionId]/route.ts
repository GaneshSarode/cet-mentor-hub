import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
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

    // Verify session belongs to user
    const { data: existingSession } = await supabase
      .from('pyq_test_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (existingSession.status === 'completed') {
      return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    // Update time remaining
    if (body.time_remaining_seconds !== undefined) {
      updateData.time_remaining_seconds = body.time_remaining_seconds;
    }

    // Submit test
    if (body.status === 'completed') {
      // Calculate score from answers
      const { data: answers } = await supabase
        .from('pyq_test_answers')
        .select('*, pyq_questions(subject, marks_positive, marks_negative)')
        .eq('session_id', sessionId);

      let score = 0;
      let correctCount = 0;
      let wrongCount = 0;

      if (answers) {
        for (const answer of answers) {
          if (answer.selected_option) {
            if (answer.is_correct) {
              correctCount++;
              const q = answer.pyq_questions as { marks_positive: number } | null;
              score += q?.marks_positive || 1;
            } else {
              wrongCount++;
              const q = answer.pyq_questions as { marks_negative: number } | null;
              score -= q?.marks_negative || 0;
            }
          }
        }
      }

      const { data: paper } = await supabase
        .from('pyq_papers')
        .select('total_questions')
        .eq('id', existingSession.paper_id)
        .single();

      const totalQuestions = paper?.total_questions || 150;
      const unattempted = totalQuestions - correctCount - wrongCount;

      updateData.status = 'completed';
      updateData.submitted_at = new Date().toISOString();
      updateData.score = score;
      updateData.correct_count = correctCount;
      updateData.wrong_count = wrongCount;
      updateData.unattempted_count = unattempted;
      updateData.time_remaining_seconds = body.time_remaining_seconds || 0;
    }

    const { data: session, error } = await supabase
      .from('pyq_test_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

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

    const { data: session, error } = await supabase
      .from('pyq_test_sessions')
      .select('*, pyq_papers(*)')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
