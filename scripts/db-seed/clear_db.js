const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log("Deleting old papers...");
  const { error } = await supabase.from('pyq_papers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) console.error("Filter error:", error.message);
  console.log("Database cleared! Ready for fixed data.");
}
run();
