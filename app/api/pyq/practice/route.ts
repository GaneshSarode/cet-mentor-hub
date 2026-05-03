import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    
    const subject = searchParams.get('subject');
    const count = Math.min(parseInt(searchParams.get('count') || '30'), 50);
    const year = searchParams.get('year');
    const topic = searchParams.get('topic');

    if (!subject || !['Physics', 'Chemistry', 'Mathematics'].includes(subject)) {
      return NextResponse.json(
        { error: 'Valid subject is required (Physics, Chemistry, Mathematics)' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('pyq_questions')
      .select('id, question_number, subject, topic, question_text, question_image_url, option_a, option_b, option_c, option_d, correct_option, solution_text, solution_image_url, difficulty, marks_positive, marks_negative, paper_id, pyq_papers(title, year, shift)')
      .eq('subject', subject);

    if (year) {
      // Filter by paper year via a subquery approach
      const { data: paperIds } = await supabase
        .from('pyq_papers')
        .select('id')
        .eq('year', parseInt(year));
      
      if (paperIds && paperIds.length > 0) {
        query = query.in('paper_id', paperIds.map(p => p.id));
      }
    }

    if (topic) {
      query = query.ilike('topic', `%${topic}%`);
    }

    const { data: questions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ questions: [], total: 0 });
    }

    // Shuffle and pick `count` questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    return NextResponse.json({ 
      questions: selected, 
      total: questions.length,
      selected: selected.length 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch practice questions' }, { status: 500 });
  }
}
