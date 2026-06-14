require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('engagements').select('*').limit(1);
  if (error) {
    console.error('Error fetching engagements:', error);
  } else {
    console.log('Successfully fetched from engagements.');
    console.log('Sample data:', data);
  }
}

checkSchema();
