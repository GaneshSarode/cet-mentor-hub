import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Fetch all completed sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from('pyq_test_sessions')
      .select('*, pyq_papers(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('submitted_at', { ascending: true });

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    // Fetch all answers for these sessions to compute topic analytics
    const sessionIds = sessions.map((s) => s.id);
    let allAnswers: any[] = [];
    
    if (sessionIds.length > 0) {
      // Chunk session IDs if necessary to avoid URI too long in Postgres
      const { data: answers, error: answersError } = await supabase
        .from('pyq_test_answers')
        .select(`
          is_correct,
          time_spent_seconds,
          question_id,
          pyq_questions (
            subject,
            topic
          )
        `)
        .in('session_id', sessionIds);

      if (answersError) {
         console.error(answersError);
      } else if (answers) {
         allAnswers = answers;
      }
    }

    // Process Topic Analytics
    const topicStats: Record<string, { total: number; correct: number; timeSpent: number, subject: string }> = {};

    allAnswers.forEach((ans) => {
      const q = ans.pyq_questions;
      if (!q || !q.topic) return;
      
      const topic = q.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, timeSpent: 0, subject: q.subject };
      }
      
      topicStats[topic].total += 1;
      if (ans.is_correct) {
        topicStats[topic].correct += 1;
      }
      topicStats[topic].timeSpent += (ans.time_spent_seconds || 0);
    });

    const topics = Object.entries(topicStats).map(([name, stats]) => ({
      name,
      subject: stats.subject,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      avgTime: stats.total > 0 ? Math.round(stats.timeSpent / stats.total) : 0,
    }));

    // Process Trend Data
    const trends = sessions.map((s) => {
      const paper = s.pyq_papers as any;
      const score = s.score || 0;
      const maxMarks = s.total_marks || 200;
      const percentage = Math.round((score / maxMarks) * 100);
      
      // We will estimate percentile using a simple formula for now or just display score/percentage.
      // E.g. simple heuristic: 99%ile is usually around 150/200 marks (75%). 
      // 50%ile is around 60/200 (30%).
      let estPercentile = 0;
      if (score >= 150) estPercentile = 99 + ((score - 150)/50)*0.99;
      else if (score >= 100) estPercentile = 90 + ((score - 100)/50)*9;
      else if (score >= 60) estPercentile = 50 + ((score - 60)/40)*40;
      else estPercentile = (score / 60) * 50;
      
      return {
        date: s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        score: score,
        percentage: percentage,
        percentile: Math.min(99.99, Math.max(0, parseFloat(estPercentile.toFixed(2)))),
        paperName: paper?.title || 'PYQ Test'
      };
    });

    return NextResponse.json({ 
      trends,
      topics 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
