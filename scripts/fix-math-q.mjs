import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://viumptzaddtysapjtskk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpdW1wdHphZGR0eXNhcGp0c2trIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgwODg0NywiZXhwIjoyMDkxMzg0ODQ3fQ.edjV25oydKGyy2paV2ONwz7n_wZ2NQLvyqVu4Iocvg4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: papers, error: pErr } = await supabase
    .from('pyq_papers')
    .select('id')
    .eq('title', 'MHT CET 2025 20th April Morning Shift');
    
  if (pErr || !papers || papers.length === 0) return;
  const paperId = papers[0].id;

  const { data: qs, error: qErr } = await supabase
    .from('pyq_questions')
    .select('*')
    .eq('paper_id', paperId);

  if (qErr) return;

  const target = qs.find(q => q.option_b.includes('19') || q.option_b.includes('17'));
  if (target) {
    console.log('Found question ID:', target.id);
    console.log('Correct option was:', target.correct_option);
    const { error: updErr } = await supabase
        .from('pyq_questions')
        .update({ correct_option: 'B' })
        .eq('id', target.id);
    if (updErr) console.error('Update failed:', updErr);
    else console.log('Successfully updated correct_option to B!');
  } else {
    console.log('Question not found');
  }
}
main();
