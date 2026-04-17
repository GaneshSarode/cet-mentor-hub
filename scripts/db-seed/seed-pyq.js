const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding PYQ Papers and Questions...');

  try {
    // 1. Insert a sample paper
    const { data: paperData, error: paperError } = await supabase
      .from('pyq_papers')
      .insert([
         {
           title: "MHTCET 2025 Morning Shift Sample",
           year: 2025,
           shift: "morning",
           exam_date: "2025-04-19",
           subject_group: "PCM",
           total_questions: 150,
           duration_minutes: 180,
           pdf_url: "https://example.com/pdf"
         }
      ])
      .select()
      .single();

    if (paperError) throw paperError;

    const paperId = paperData.id;
    console.log(`Created paper: ${paperData.title} with ID: ${paperId}`);

    // 2. Insert sample questions (1 Maths, 1 Physics, 1 Chemistry) for testing
    const questions = [
      {
        paper_id: paperId,
        question_number: 1,
        subject: "Mathematics",
        topic: "Calculus",
        question_text: "Evaluate the integral: $$\\int_{0}^{\\pi/2} \\sin^2(x) dx$$",
        option_a: "$$\\pi/4$$",
        option_b: "$$\\pi/2$$",
        option_c: "$$\\pi$$",
        option_d: "$$0$$",
        correct_option: "A",
        solution_text: "Using the property $\\int_{0}^{a} f(x) dx = \\int_{0}^{a} f(a-x) dx$, we add it to the original integral to get $2I = \\int_{0}^{\\pi/2} 1 dx = \\pi/2 \\Rightarrow I = \\pi/4$.",
        difficulty: "medium",
        marks_positive: 2,
        marks_negative: 0
      },
      {
        paper_id: paperId,
        question_number: 2,
        subject: "Physics",
        topic: "Kinematics",
        question_text: "A particle moves with an initial velocity of 5 m/s and a constant acceleration of 2 m/s$^2$. Find its displacement after 10 seconds.",
        option_a: "100 m",
        option_b: "150 m",
        option_c: "200 m",
        option_d: "50 m",
        correct_option: "B",
        solution_text: "Using $s = ut + \\frac{1}{2}at^2$, $s = (5)(10) + 0.5(2)(100) = 50 + 100 = 150$ m.",
        difficulty: "easy",
        marks_positive: 1,
        marks_negative: 0
      },
      {
        paper_id: paperId,
        question_number: 3,
        subject: "Chemistry",
        topic: "Thermodynamics",
        question_text: "Which of the following is an intensive property?",
        option_a: "Volume",
        option_b: "Mass",
        option_c: "Temperature",
        option_d: "Heat Capacity",
        correct_option: "C",
        solution_text: "Temperature does not depend on the quantity of matter present, hence it is an intensive property.",
        difficulty: "easy",
        marks_positive: 1,
        marks_negative: 0
      }
    ];

    const { error: qError } = await supabase.from('pyq_questions').insert(questions);
    
    if (qError) throw qError;

    console.log(`Successfully seeded ${questions.length} sample questions.`);
    console.log("Seed complete! You can now test the test engine.");

  } catch (err) {
    console.error("Error during seeding:", err);
  }
}

seed();
