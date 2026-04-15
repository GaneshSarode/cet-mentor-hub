import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('pyq_test_sessions')
      .select('*, pyq_papers(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    const body = await request.json();
    const { paper_id } = body;

    if (!paper_id) {
      return NextResponse.json({ error: 'paper_id is required' }, { status: 400 });
    }

    // Check for existing in-progress session
    const { data: existingSession } = await supabase
      .from('pyq_test_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('paper_id', paper_id)
      .eq('status', 'in_progress')
      .single();

    if (existingSession) {
      return NextResponse.json({ session: existingSession, resumed: true });
    }

    // Get paper details for total_questions
    const { data: paper } = await supabase
      .from('pyq_papers')
      .select('total_questions, duration_minutes')
      .eq('id', paper_id)
      .single();

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Create new session
    const { data: session, error } = await supabase
      .from('pyq_test_sessions')
      .insert({
        user_id: userId,
        paper_id,
        status: 'in_progress',
        time_remaining_seconds: paper.duration_minutes * 60,
        unattempted_count: paper.total_questions,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session, resumed: false });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
