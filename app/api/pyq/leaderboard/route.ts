import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const paperId = searchParams.get('paper_id');

    // Build query for completed sessions
    let query = supabase
      .from('pyq_test_sessions')
      .select('user_id, score, total_marks, correct_count, wrong_count, paper_id, pyq_papers(title, year, shift)')
      .eq('status', 'completed')
      .not('score', 'is', null);

    if (paperId) {
      query = query.eq('paper_id', paperId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Aggregate by user: best score per paper, total across all papers
    const userMap = new Map<string, {
      user_id: string;
      totalScore: number;
      totalMaxMarks: number;
      testsTaken: number;
      bestScore: number;
      bestMaxMarks: number;
      totalCorrect: number;
      totalWrong: number;
      paperScores: Map<string, { score: number; maxMarks: number }>;
    }>();

    for (const session of sessions) {
      const uid = session.user_id;
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user_id: uid,
          totalScore: 0,
          totalMaxMarks: 0,
          testsTaken: 0,
          bestScore: 0,
          bestMaxMarks: 200,
          totalCorrect: 0,
          totalWrong: 0,
          paperScores: new Map(),
        });
      }

      const user = userMap.get(uid)!;
      const score = session.score || 0;
      const maxMarks = session.total_marks || 200;

      // Track best score per paper (so retakes don't inflate total)
      const existing = user.paperScores.get(session.paper_id);
      if (!existing || score > existing.score) {
        user.paperScores.set(session.paper_id, { score, maxMarks });
      }

      user.testsTaken++;
      user.totalCorrect += session.correct_count || 0;
      user.totalWrong += session.wrong_count || 0;

      if (score > user.bestScore) {
        user.bestScore = score;
        user.bestMaxMarks = maxMarks;
      }
    }

    // Calculate total from best-per-paper
    for (const user of userMap.values()) {
      user.totalScore = 0;
      user.totalMaxMarks = 0;
      for (const ps of user.paperScores.values()) {
        user.totalScore += ps.score;
        user.totalMaxMarks += ps.maxMarks;
      }
    }

    // Sort by total score descending
    const sorted = Array.from(userMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 50);

    // Build leaderboard entries (don't expose raw user_ids to client)
    const leaderboard = sorted.map((user, index) => ({
      rank: index + 1,
      user_id: user.user_id,
      totalScore: user.totalScore,
      totalMaxMarks: user.totalMaxMarks,
      testsTaken: user.testsTaken,
      bestScore: user.bestScore,
      bestMaxMarks: user.bestMaxMarks,
      accuracy: user.totalCorrect + user.totalWrong > 0
        ? Math.round((user.totalCorrect / (user.totalCorrect + user.totalWrong)) * 100)
        : 0,
      papersAttempted: user.paperScores.size,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
