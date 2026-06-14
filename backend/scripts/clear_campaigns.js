const supabase = require('../src/config/supabase');

async function run() {
  console.log('Deleting all campaigns from db...');
  const { error } = await supabase.from('campaigns').delete().neq('id', 0);
  if (error) console.error(error);
  else console.log('Successfully deleted all campaigns.');
}

run();
