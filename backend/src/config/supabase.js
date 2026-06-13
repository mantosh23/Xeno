const { createClient } = require('@supabase/supabase-js');

// Ensure these variables are defined in your backend/.env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Please check your .env file.");
}

/**
 * @constant supabase
 * @description A singleton instance of the Supabase Client used to query the database throughout the backend.
 * Uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables.
 */
// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
