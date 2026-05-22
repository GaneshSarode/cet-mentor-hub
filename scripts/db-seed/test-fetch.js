const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('pyq_papers')
    .select('id, title, year, exam_date, shift, subject_group, is_active')
    .eq('is_active', true);
    
  if (error) {
    console.error(error);
    return;
  }
  
  data.sort((a, b) => {
    // 1. Sort by year descending (2025 before 2024)
    if (b.year !== a.year) {
      return b.year - a.year;
    }
    
    // 2. Sort by exam_date ascending
    const dateA = a.exam_date || "";
    const dateB = b.exam_date || "";
    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }
    
    // 3. Sort by shift: "morning" shift before "evening" shift
    if (a.shift === "morning" && b.shift === "evening") return -1;
    if (a.shift === "evening" && b.shift === "morning") return 1;
    
    return 0;
  });
  
  console.log("Sorted papers titles in order:");
  data.forEach((p, index) => {
    console.log(`${index + 1}. ${p.title} (${p.exam_date}, ${p.shift})`);
  });
}

run();
