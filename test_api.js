const fetch = require('node-fetch');

async function test() {
  try {
    // 1. Get token
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: './backend/.env' });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // We'll just try to login with a known user or skip auth if possible
    // Wait, let's just make the request without auth and see what happens
    console.log("Fetching /api/analytics without auth...");
    const res = await fetch('http://localhost:3001/api/analytics');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);

  } catch (e) {
    console.error(e);
  }
}

test();
