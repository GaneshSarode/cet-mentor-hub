const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('Fetching papers...');
  const { data: papers, error } = await supabase.from('pyq_papers').select('*');
  
  if (error) {
    console.error('Error fetching:', error);
    return;
  }
  
  if (papers.length <= 1) {
    console.log('Only 1 paper exists, nothing to clean.');
    return;
  }
  
  console.log(`Found ${papers.length} papers. Keeping the first one, deleting the rest...`);
  
  const keepId = papers[0].id;
  const deleteIds = papers.slice(1).map(p => p.id);
  
  if(deleteIds.length > 0){
    const { error: delError } = await supabase.from('pyq_papers').delete().in('id', deleteIds);
    if(delError) {
      console.error('Error deleting:', delError);
    } else {
      console.log(`Successfully deleted ${deleteIds.length} duplicate papers.`);
    }
  }
}

cleanup();
