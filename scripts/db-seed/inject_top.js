const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.service_role);

async function run() {
  const { data: coep } = await supabase.from('colleges').select('id, name').ilike('name', '%COEP%').single();
  const { data: spit } = await supabase.from('colleges').select('id, name').ilike('name', '%Sardar Patel Institute%').single();
  const { data: pict } = await supabase.from('colleges').select('id, name').ilike('name', '%Pune Institute%').single();
  
  console.log("COEP:", coep?.name);
  console.log("SPIT:", spit?.name);
  console.log("PICT:", pict?.name);

  // COEP Database insertion
  if (coep) {
    const { data: b } = await supabase.from('branches').upsert(
      { college_id: coep.id, course_code: '600624510', name: 'Computer Engineering' },
      { onConflict: 'course_code' }
    ).select('id').single();

    if (b) {
      await supabase.from('cutoffs').insert([
        { branch_id: b.id, academic_year: '24-25', cap_round: 3, category: 'GOPENS', percentile: 99.8012, merit_no: 110 },
        { branch_id: b.id, academic_year: '24-25', cap_round: 3, category: 'GOBCS', percentile: 99.6521, merit_no: 254 },
        { branch_id: b.id, academic_year: '24-25', cap_round: 3, category: 'LOPENS', percentile: 99.7500, merit_no: 160 },
        { branch_id: b.id, academic_year: '24-25', cap_round: 3, category: 'LOBCS',  percentile: 99.5500, merit_no: 290 },
        { branch_id: b.id, academic_year: '24-25', cap_round: 3, category: 'GSCS', percentile: 98.0100, merit_no: 1054 },
      ]);
      console.log("COEP Computer Engineering Added");
    }
  }
}

run().catch(console.error);
