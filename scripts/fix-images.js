const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We use Anon Key if Service Role Key is missing. Make sure your bucket is public and allows inserts.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// IMPORTANT: Ensure you have created a public bucket named "question-images" in your Supabase dashboard!
const BUCKET_NAME = 'question-images';

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function processText(text) {
  if (!text) return text;
  
  // Find all examgoal image URLs
  const regex = /<img[^>]*src="([^"]*examgoal\.net[^"]*)"[^>]*>/g;
  let matches;
  let updatedText = text;
  
  // Find all matches first so we don't mess up the regex while replacing
  const urlsToProcess = [];
  while ((matches = regex.exec(text)) !== null) {
    urlsToProcess.push(matches[1]);
  }
  
  for (const originalUrl of urlsToProcess) {
    console.log(`Found image: ${originalUrl}`);
    
    try {
      // Generate a unique filename based on the URL so we don't duplicate
      const hash = crypto.createHash('md5').update(originalUrl).digest('hex');
      let ext = originalUrl.split('.').pop().split('?')[0];
      if (!['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
          ext = 'png';
      }
      const fileName = `${hash}.${ext}`;
      
      // Download the image
      console.log(`Downloading ${fileName}...`);
      const buffer = await downloadImage(originalUrl);
      
      // Upload to Supabase
      console.log(`Uploading ${fileName} to Supabase...`);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, {
          contentType: `image/${ext}`,
          upsert: true
        });
        
      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);
        
      const newUrl = publicUrlData.publicUrl;
      console.log(`New URL: ${newUrl}`);
      
      // Replace in text
      updatedText = updatedText.replace(originalUrl, newUrl);
      
      // Also check if data-orsrc has the examgoal link and replace it
      updatedText = updatedText.replace(/data-orsrc="[^"]*examgoal\.net[^"]*"/g, `data-orsrc="${newUrl}"`);
      
    } catch (e) {
      console.error(`Failed to process ${originalUrl}:`, e.message);
    }
  }
  
  return updatedText;
}

async function main() {
  console.log('Fetching questions with ExamGoal images...');
  
  const { data: questions, error } = await supabase
    .from('pyq_questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, solution_text');
    
  if (error) {
    console.error('Error fetching questions:', error.message);
    return;
  }
  
  const affectedQuestions = questions.filter(q => 
    (q.question_text && q.question_text.includes('examgoal.net')) ||
    (q.option_a && q.option_a.includes('examgoal.net')) ||
    (q.option_b && q.option_b.includes('examgoal.net')) ||
    (q.option_c && q.option_c.includes('examgoal.net')) ||
    (q.option_d && q.option_d.includes('examgoal.net')) ||
    (q.solution_text && q.solution_text.includes('examgoal.net'))
  );
  
  console.log(`Found ${affectedQuestions.length} questions to process.`);
  
  let processed = 0;
  for (const q of affectedQuestions) {
    console.log(`\nProcessing Question ID: ${q.id}`);
    
    const updates = {};
    
    if (q.question_text && q.question_text.includes('examgoal.net')) {
      updates.question_text = await processText(q.question_text);
    }
    if (q.option_a && q.option_a.includes('examgoal.net')) {
      updates.option_a = await processText(q.option_a);
    }
    if (q.option_b && q.option_b.includes('examgoal.net')) {
      updates.option_b = await processText(q.option_b);
    }
    if (q.option_c && q.option_c.includes('examgoal.net')) {
      updates.option_c = await processText(q.option_c);
    }
    if (q.option_d && q.option_d.includes('examgoal.net')) {
      updates.option_d = await processText(q.option_d);
    }
    if (q.solution_text && q.solution_text.includes('examgoal.net')) {
      updates.solution_text = await processText(q.solution_text);
    }
    
    // Save to database
    if (Object.keys(updates).length > 0) {
      console.log(`Updating database for question ${q.id}...`);
      const { error: updateError } = await supabase
        .from('pyq_questions')
        .update(updates)
        .eq('id', q.id);
        
      if (updateError) {
        console.error(`Failed to update question ${q.id}:`, updateError.message);
      } else {
        processed++;
        console.log(`Success!`);
      }
    }
  }
  
  console.log(`\nDone! Successfully fixed ${processed} questions.`);
}

main();
