const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Absolute path to .env.local from this file's location
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Reading JSON file...');
  const jsonPath = path.join(__dirname, '../scrape-pyq/pyq_mht_cet_2025_22_morning.json');
  
  if (!fs.existsSync(jsonPath)) {
      console.error(`File not found: ${jsonPath}`);
      process.exit(1);
  }
  
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const questions = JSON.parse(rawData);

  console.log(`Found ${questions.length} questions in JSON. Seeding into Supabase...`);

  try {
    // 1. Check if paper exists, otherwise insert
    const paperTitle = "MHT CET 2025 22nd April Morning Shift";
    let { data: existingPaper, error: fetchError } = await supabase
      .from('pyq_papers')
      .select('id')
      .eq('title', paperTitle)
      .single();
      
    let paperId;
    if (existingPaper) {
        paperId = existingPaper.id;
        console.log(`Found existing paper: ${paperTitle} with ID: ${paperId}`);
    } else {
        const { data: paperData, error: paperError } = await supabase
          .from('pyq_papers')
          .insert([
             {
               title: paperTitle,
               year: 2025,
               shift: "morning",
               exam_date: "2025-04-22",
               subject_group: "PCM", 
               total_questions: questions.length,
               duration_minutes: 180, // Standard 3 hour duration
               pdf_url: null
             }
          ])
          .select()
          .single();
    
        if (paperError) throw paperError;
        paperId = paperData.id;
        console.log(`Created paper: ${paperData.title} with ID: ${paperId}`);
    }
    console.log(`Working with paper ID: ${paperId}`);

    // 2. Prepare questions for database insert
    const formattedQuestions = questions.map((q, index) => {
        // MHT CET Scoring: Maths = 2 marks, Physics/Chemistry = 1 mark
        const marks_positive = q.subject === 'Mathematics' ? 2 : 1;
        
        return {
            paper_id: paperId,
            question_number: index + 1,
            subject: q.subject,
            topic: "Mixed", // We don't have topic-level categorization yet
            question_text: q.question || "Question text missing",
            option_a: q.options && q.options.A ? q.options.A : "",
            option_b: q.options && q.options.B ? q.options.B : "",
            option_c: q.options && q.options.C ? q.options.C : "",
            option_d: q.options && q.options.D ? q.options.D : "",
            correct_option: q.correct || "A", 
            solution_text: q.solution || "",
            difficulty: "medium", // Default
            marks_positive: marks_positive,
            marks_negative: 0 // MHT CET has no negative marking
        }
    });

    // 3. Insert questions in batches
    console.log(`Uploading ${formattedQuestions.length} questions...`);
    
    // Supabase can handle many inserts, but batching by 50 ensures we don't hit payload limits
    for (let i = 0; i < formattedQuestions.length; i += 50) {
        const batch = formattedQuestions.slice(i, i + 50);
        const { error: qError } = await supabase.from('pyq_questions').upsert(batch, { onConflict: 'paper_id, question_number' });
        
        if (qError) {
             console.error(`Error inserting batch ${i/50 + 1}:`, qError);
             throw qError;
        }
        console.log(`✓ Uploaded batch ${i/50 + 1}`);
    }

    console.log(`\n🎉 Success! Seeded 1 full paper and ${formattedQuestions.length} questions into the database.`);

  } catch (err) {
    console.error("Error during seeding:", err);
  }
}

seed();
