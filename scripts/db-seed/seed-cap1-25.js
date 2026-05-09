const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Loading parsed cutoffs for CAP 1 2025-26...");
  const dataPath = path.join(__dirname, '../pdf-extractor/parsed_cutoffs.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error("Parsed data not found!");
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Found ${dataset.length} college/branch entries to process.`);

  // 1. Delete existing 25-26 CAP 1 data to prevent duplicates on rerun
  console.log("Cleaning up any existing 25-26 CAP 1 data...");
  const { error: delErr } = await supabase
    .from('cutoffs')
    .delete()
    .eq('academic_year', '25-26')
    .eq('cap_round', 1);

  if (delErr) {
    console.error("Error cleaning up old data:", delErr);
    return;
  }

  let cutoffsBatch = [];
  const BATCH_SIZE = 500;
  let totalCutoffsInserted = 0;

  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];

    // Insert or get College
    let { data: collegeData, error: errC } = await supabase
      .from('colleges')
      .upsert({
        dtem_code: entry.college_id,
        name: entry.college_name,
        type: "Unknown",
        city: "Unknown"
      }, { onConflict: 'dtem_code' })
      .select('id')
      .single();

    if (errC || !collegeData) continue;
    
    // Insert or get Branch
    let { data: branchData, error: errB } = await supabase
      .from('branches')
      .upsert({
        college_id: collegeData.id,
        course_code: entry.branch_code,
        name: entry.branch
      }, { onConflict: 'course_code' })
      .select('id')
      .single();

    if (errB || !branchData) continue;

    // Collect cutoffs
    for (const cutoff of entry.cutoffs) {
      cutoffsBatch.push({
        branch_id: branchData.id,
        academic_year: entry.academic_year,
        cap_round: entry.cap_round,
        category: cutoff.category,
        percentile: cutoff.percentile,
        merit_no: cutoff.merit_no || null
      });
    }

    // Insert batch if it gets large enough
    if (cutoffsBatch.length >= BATCH_SIZE || i === dataset.length - 1) {
      if (cutoffsBatch.length > 0) {
        const { error: errCutoff } = await supabase
          .from('cutoffs')
          .insert(cutoffsBatch);
          
        if (errCutoff) {
            console.error(`Error inserting cutoffs batch:`, errCutoff);
        } else {
            totalCutoffsInserted += cutoffsBatch.length;
            console.log(`Progress: Inserted ${totalCutoffsInserted} cutoffs so far...`);
        }
        cutoffsBatch = [];
      }
    }
  }
  
  console.log(`\n✅ Seeding complete! Successfully inserted ${totalCutoffsInserted} cutoffs for CAP 1 25-26.`);
}

seed();
