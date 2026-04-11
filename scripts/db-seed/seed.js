const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.service_role
// IMPORTANT: You might need the Supabase Service Role Key to bypass RLS for inserts if RLS is enabled

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Loading parsed cutoffs...");
  const dataPath = path.join(__dirname, '../pdf-extractor/parsed_cutoffs.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error("Parsed data not found. Please run the python extractor first!");
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Found ${dataset.length} college entries to process.`);

  for (const entry of dataset) {
    // 1. Insert or get College
    let { data: collegeData, error: errC } = await supabase
      .from('colleges')
      .upsert({
        dtem_code: entry.college_id,
        name: entry.college_name,
        type: "Unknown", // Can map later
        city: "Unknown"
      }, { onConflict: 'dtem_code' })
      .select('id')
      .single();

    if (errC || !collegeData) {
      console.error(`Error inserting college ${entry.college_id}:`, errC);
      continue;
    }
    
    // 2. Insert or get Branch
    let { data: branchData, error: errB } = await supabase
      .from('branches')
      .upsert({
        college_id: collegeData.id,
        course_code: entry.branch_code,
        name: entry.branch
      }, { onConflict: 'course_code' })
      .select('id')
      .single();

    if (errB || !branchData) {
      console.error(`Error inserting branch ${entry.branch_code}:`, errB);
      continue;
    }

    // 3. Insert cutoffs
    for (const cutoff of entry.cutoffs) {
       const { error: errCutoff } = await supabase
        .from('cutoffs')
        .insert({
         branch_id: branchData.id,
         academic_year: entry.academic_year,
         cap_round: entry.cap_round,
         category: cutoff.category,
         percentile: cutoff.percentile,
         merit_no: cutoff.merit_no || null
        });
      if (errCutoff) {
          console.error(`Error inserting cutoff for branch ${entry.branch_code} category ${cutoff.category}:`, errCutoff);
      }
    }
    
    console.log(`Seeded ${entry.college_name} - ${entry.branch}`);
  }
  
  console.log("Seeding complete!");
}

seed();
